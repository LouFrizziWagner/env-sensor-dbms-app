/** Create HDR histogram and summary stats Html report from log files */

import fs from 'fs';
import path from 'path';
import hdr from 'hdr-histogram-js';
import { decodeFromCompressedBase64 } from 'hdr-histogram-js';

// helpers
function extractLabel(filePath) {
  const baseName = path.basename(filePath);
  const match = baseName.match(/(_Get.*?)(?:\.hlog|\.jtl)$/);
  return match ? match[1].replace(/^_/, '') : baseName;
}

const HISTOGRAM_LOG_DIR = "./logs";
const OUTPUT_PLOTS_DIR = path.join(process.cwd(), 'latency-plots');

if (!fs.existsSync(OUTPUT_PLOTS_DIR)) {
  fs.mkdirSync(OUTPUT_PLOTS_DIR, { recursive: true });
}

// grouping files by the type suffix 
const histogramFiles = fs.readdirSync(HISTOGRAM_LOG_DIR).filter(f => f.endsWith('.hlog'));

const groupedBySuffix = {};

for (const file of histogramFiles) {
  const match = file.match(/_([^_]+(?:-[\w\d]+)?)\.hlog$/);
  if (!match) continue;
  const groupKey = match[1];
  if (!groupedBySuffix[groupKey]) groupedBySuffix[groupKey] = [];
  groupedBySuffix[groupKey].push(file);
}

// process each  pair that matches together
for (const [groupKey, matchedFiles] of Object.entries(groupedBySuffix)) {
  if (matchedFiles.length !== 2) {
    console.warn(`Skipping "${groupKey}": expected 2 files, got ${matchedFiles.length}`);
    matchedFiles.forEach(f => console.warn('  ->', f));
    continue;
  }

  let mysqlPath, mongoPath;

  for (const file of matchedFiles) {
    const fullPath = path.join(HISTOGRAM_LOG_DIR, file);
    if (file.toLowerCase().includes('mysql')) mysqlPath = fullPath;
    else if (file.toLowerCase().includes('mongodb')) mongoPath = fullPath;
  }

  if (!mysqlPath || !mongoPath) {
    console.warn(`Could not match both MySQL and MongoDB files for "${groupKey}"`);
    matchedFiles.forEach(f => console.warn('  ->', f));
    continue;
  }

  const filePathMySQL = mysqlPath;
  const filePathMongo = mongoPath;

  const labelMySQL = extractLabel(filePathMySQL);
  const labelMongo = extractLabel(filePathMongo);

  const outputFileName = `${labelMySQL}_vs_${labelMongo}.html`;
  const outputFilePath = path.join(OUTPUT_PLOTS_DIR, outputFileName);

  console.log(`Working on pair: "${groupKey}"`);
  console.log('   MySQL:', filePathMySQL.includes('mysql') ? filePathMySQL : filePathMongo);
  console.log('   MongoDB:', filePathMySQL.includes('mongodb') ? filePathMySQL : filePathMongo);

  function getHistogramStats(histogram) {
    return {
      min: histogram.minNonZeroValue,
      max: histogram.maxValue,
      average: histogram.getMean?.() ?? estimateMean(histogram),
      p99: histogram.getValueAtPercentile(99)
    };
  }

  function estimateMean(histogram) {
    let sum = 0;
    for (let p = 0.1; p <= 99.9; p += 0.1) {
      sum += histogram.getValueAtPercentile(p);
    }
    return sum / 999;
  }

  function loadHistogramFromFile(filePath) {
    const histogram = hdr.build({
      lowestDiscernibleValue: 1,
      highestTrackableValue: 60000,
      numberOfSignificantValueDigits: 3
    });

    const lines = fs.readFileSync(filePath, 'utf8')
      .split('\n')
      .filter(line => line && !line.startsWith('#') && line.includes(','));

    for (const line of lines.slice(1)) {
      const encoded = line.split(',')[3]?.replace(/"/g, '');
      if (!encoded) continue;
      try {
        const h = decodeFromCompressedBase64(encoded);
        histogram.add(h);
      } catch {
        console.warn(`Skipped bad histogram line from ${filePath}`);
      }
    }
    return histogram;
  }

  function createTraceSeries(histMySQL, histMongo, labelA, labelB, startPercentile, endPercentile) {
    const percentiles = [];
    const latenciesMySQL = [];
    const latenciesMongo = [];

    for (let p = startPercentile; p <= endPercentile; p += 0.01) {
      const percentile = parseFloat(p.toFixed(2));
      percentiles.push(percentile);
      latenciesMySQL.push(histMySQL.getValueAtPercentile(percentile));
      latenciesMongo.push(histMongo.getValueAtPercentile(percentile));
    }

    return [
      {
        x: percentiles,
        y: latenciesMySQL,
        name: `<b> <span style="color: rgba(0, 107, 230, 1);">MySQL</span></b><br><br>avg: ${statsMySQL.average.toFixed(2)} ms<br>p99: ${statsMySQL.p99.toFixed(2)} ms`,
        mode: 'lines+markers',
        type: 'scatter',
        marker: { size: 2 },
        line: { shape: 'hv', color: 'rgba(0, 107, 230, 1)' }
      },
      {
        x: percentiles,
        y: latenciesMongo,
        name: `<b> <span style="color: rgb(0, 142, 28);"> MongoDB </span></b><br><br>avg: ${statsMongo.average.toFixed(2)} ms<br>p99: ${statsMongo.p99.toFixed(2)} ms`,
        mode: 'lines+markers',
        type: 'scatter',
        marker: { size: 2 },
        line: { shape: 'hv', color: 'rgb(0, 142, 28)' }
      }
    ];
  }

  const histMySQL = loadHistogramFromFile(filePathMySQL);
  const histMongo = loadHistogramFromFile(filePathMongo);

  const statsMySQL = getHistogramStats(histMySQL);
  const statsMongo = getHistogramStats(histMongo);

  const traceAllPercentiles = createTraceSeries(histMySQL, histMongo, 'MySQL', 'MongoDB', 0, 100);
  const trace95to100 = createTraceSeries(histMySQL, histMongo, 'MySQL', 'MongoDB', 95, 100);
  const trace99to99_99 = createTraceSeries(histMySQL, histMongo, 'MySQL', 'MongoDB', 99.0, 99.99);


  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Latency Comparison: MySQL vs MongoDB</title>
  <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
  <style>
    body { font-family: sans-serif; margin: 20px; }
    h2 { font-size: 22px; margin-top: 40px; }
  </style>
</head>
<body>
  <h1>Latency Percentile Comparison – MySQL vs MongoDB</h1>

  <h2>Latency Percentile Distribution (0–100%)</h2>
  <div style="display: flex;">
    <div style="background-color: rgba(0, 0, 255, 0.154); padding: 0 1rem 0;">
      <h3>MySQL Stats</h3>
      <ul>
        <li><b>Average:</b> ${statsMySQL.average.toFixed(2)} ms</li>
        <li><b>Min:</b> ${statsMySQL.min} ms</li>
        <li><b>Max:</b> ${statsMySQL.max} ms</li>
        <li><b>P99:</b> ${statsMySQL.p99} ms</li>
      </ul>
    </div>
    <div style="background-color:rgba(0, 128, 0, 0.179); padding: 0 1rem 0;">
      <h3>MongoDB Stats</h3>
      <ul>
        <li><b>Average:</b> ${statsMongo.average.toFixed(2)} ms</li>
        <li><b>Min:</b> ${statsMongo.min} ms</li>
        <li><b>Max:</b> ${statsMongo.max} ms</li>
        <li><b>P99:</b> ${statsMongo.p99} ms</li>
      </ul>
    </div>
  </div>

  <div id="plot1" style="height:800px;"></div>
  <h2>Latency Percentile Distribution (95-100%)</h2>
  <div id="plot2" style="height:800px;"></div>
  <h2>Latency Percentile Distribution (99.0-99.99%)</h2>
  <div id="plot3" style="height:
