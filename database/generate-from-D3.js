/* Uses D3 CSV (April–Nov 2021) */
/* Creates synthetic D5 CSV (April–Nov 2022), preserving intervals from D3 */
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
const inputFile = path.join(__dirname, 'data', 'D3_sensor_data_synthetic.csv');
const outputFile = path.join(__dirname, 'data', 'D5_sensor_data_synthetic.csv');

// Original D3 start timestamp
const d3Start = dayjs('2021-04-15T00:00:37+00:00');
// D5 should start just after D4 ends
const d5Start = dayjs('2022-04-15T00:59:35+02:00');

// Calculate offset
const offsetMs = d5Start.diff(d3Start); // in milliseconds

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

    // Preserve all data fields
    newRow.temperature = row.temperature;
    newRow.humidity = row.humidity;
    newRow.is_test_data = true;

    outputRows.push(newRow);
  })
  .on('end', () => {
    const parser = new Parser();
    const csvOutput = parser.parse(outputRows);
    fs.writeFileSync(outputFile, csvOutput, 'utf8');
    console.log(`D5 created at: ${outputFile}`);
  });