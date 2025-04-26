/* Uses D1 CSV of time range April, 2020 and October, 2020 */
/* Create synthetic data D3 for April, 2021 and October, 2021*/ 
/* Shift D1 timestamps into 2021, preserving exact row-to-row timing */
/* Summer Time Range */


import fs from 'fs';
import csv from 'csv-parser';
import { Parser } from 'json2csv';
import dayjs from 'dayjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const inputFile = path.join(__dirname, 'data', 'D1_sensor_data.csv');
const outputFile = path.join(__dirname, 'data', 'D3_sensor_data_synthetic.csv');

// D1 starts:
const d1Start = dayjs('2020-04-16T04:30:37+00:00');
// D3 should start:
const d3Start = dayjs('2021-04-15T00:00:37+00:00');

// Calculate offset
const offsetMs = d3Start.diff(d1Start); // in milliseconds

const outputRows = [];

fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    const newRow = { ...row };

    const original = dayjs(row.published_at);
    const shifted = original.add(offsetMs, 'millisecond');

    newRow.published_at = shifted.format('YYYY-MM-DD HH:mm:ssZ');
    newRow.date = shifted.format('M/D/YY');
    newRow.time = shifted.format('H:mm:ss');

    // Keep all other fields intact
    newRow.temperature = row.temperature;
    newRow.humidity = row.humidity;
    newRow.is_test_data = true;

    outputRows.push(newRow);
  })
  .on('end', () => {
    const parser = new Parser();
    const csvOutput = parser.parse(outputRows);
    fs.writeFileSync(outputFile, csvOutput, 'utf8');
    console.log(`D3 created at: ${outputFile}`);
  });