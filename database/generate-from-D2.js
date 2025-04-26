/* Uses D2 CSV of time range October, 2020 and April, 2021 */
/* Creates synthetic data D4 with a +1 year shift Nov 2021 – Apr 2022 */
/* Winter Time Range */


import fs from 'fs';
import csv from 'csv-parser';
import { Parser } from 'json2csv';
import dayjs from 'dayjs';
import path from 'path';
import { fileURLToPath } from 'url';

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, 'data', 'D2_sensor_data.csv');
const outputFile = path.join(__dirname, 'data', 'D4_sensor_data_synthetic.csv');

// Original and new start times
const d2Start = dayjs('2020-11-06T00:00:09+00:00');
const d4Start = dayjs('2021-11-05T23:59:56+01:00'); // just after D3 ends

// Calculate time offset in ms
const offsetMs = d4Start.diff(d2Start);

// Storage for output
const outputRows = [];

fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    const newRow = { ...row };

    // Shift timestamp
    const original = dayjs(row.published_at);
    const shifted = original.add(offsetMs, 'millisecond');

    newRow.published_at = shifted.format('YYYY-MM-DD HH:mm:ssZ');
    newRow.date = shifted.format('M/D/YY');
    newRow.time = shifted.format('H:mm:ss');

    // Keep all values intact, mark as synthetic
    newRow.temperature = row.temperature;
    newRow.humidity = row.humidity;
    newRow.is_test_data = true;

    outputRows.push(newRow);
  })
  .on('end', () => {
    const parser = new Parser();
    const csvOutput = parser.parse(outputRows);
    fs.writeFileSync(outputFile, csvOutput, 'utf8');
    console.log(`D4 created at: ${outputFile}`);
  });