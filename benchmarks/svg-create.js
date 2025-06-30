/** Export SVG file from the html reports */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const LATENCY_PLOTS_DIR = "/Users/louwagner/Documents/ThesisAppStudy/env-sensor-dbms-app/benchmarks/last/latency-plots";

if (!LATENCY_PLOTS_DIR || !fs.existsSync(LATENCY_PLOTS_DIR)) {
  console.error('Invalid input directory path.');
  process.exit(1);
}

const exportPlotSvg = async (page, plotElementId, outputFilePath) => {
  const plotExists = await page.$(`#${plotElementId}`);
  if (!plotExists) {
    console.warn(`Plot "${plotElementId}" not found, skipping.`);
    return;
  }

  const svgDataUri = await page.evaluate(async (id) => {
    const element = document.getElementById(id);
    const svgUri = await Plotly.toImage(element, {
      format: 'svg',
      width: 1600,
      height: 800
    });
    return svgUri;
  }, plotElementId);

  const svgContent = decodeURIComponent(svgDataUri.split(',')[1]);
  fs.writeFileSync(outputFilePath, svgContent, 'utf8');
  console.log(`Saved: ${outputFilePath}`);
};


(async () => {
  const browser = await puppeteer.launch();
  const htmlFiles = fs.readdirSync(LATENCY_PLOTS_DIR).filter(f => f.endsWith('.html'));

  for (const htmlFile of htmlFiles) {
    const fullPath = path.resolve(LATENCY_PLOTS_DIR, htmlFile);
    const baseName = path.basename(htmlFile, '.html');
    const page = await browser.newPage();

    console.log(`Processing: ${htmlFile}`);
    await page.goto('file://' + fullPath, { waitUntil: 'networkidle0' });

    await exportPlotSvg(page, 'plot1', path.join(LATENCY_PLOTS_DIR, `${baseName}_plot1.svg`));
    await exportPlotSvg(page, 'plot2', path.join(LATENCY_PLOTS_DIR, `${baseName}_plot2.svg`));
    await exportPlotSvg(page, 'plot3', path.join(LATENCY_PLOTS_DIR, `${baseName}_plot3.svg`));

    await page.close();
  }

  await browser.close();
})();
