/* Uses D2 CSV of time range Nov 2020 – Apr 2021 */
/* Creates synthetic data D6 starting Nov 2022, continuing D2's timing */
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
const outputFile = path.join(__dirname, 'data', 'D6_sensor_data_synthetic.csv');

// Original D2 start:
const d2Start = dayjs('2020-11-06T00:00:09+00:00');

// D6 should start just after D5 ends
const d6Start = dayjs('2022-11-04T19:30:37+01:00');

// Time shift offset
const offsetMs = d6Start.diff(d2Start);

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

    // Preserve all fields, flag as synthetic
    newRow.temperature = row.temperature;
    newRow.humidity = row.humidity;
    newRow.is_test_data = true;

    outputRows.push(newRow);
  })
  .on('end', () => {
    const parser = new Parser();
    const csvOutput = parser.parse(outputRows);
    fs.writeFileSync(outputFile, csvOutput, 'utf8');
    console.log(`D6 created at: ${outputFile}`);
  });