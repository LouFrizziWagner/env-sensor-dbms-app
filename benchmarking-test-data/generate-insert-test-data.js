import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dayjs from 'dayjs';
import HiveObservation from '../models/mysql/HiveObservation.js';

/** Read from csv D1, 
 * create artificial data and validate through sequelize */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join('database', 'data', 'D1_sensor_data.csv');
const outputFile = path.join(__dirname, 'synthetic_20000_from_csv.json');
const totalRecords = 200000;
const incrementMinutes = 5;

//let currentTimestamp = dayjs('2023-04-15T00:59:35+02:00');
let currentTimestamp = dayjs('2023-04-18T10:14:35+02:00').add(5, 'minute');

//2023-04-18T10:14:35.000Z

const sourceRows = [];
const outputRows = [];

// build and validate each row
async function createValidatedHiveObservation(sourceRow, timestamp) {
  const record = HiveObservation.build({
    published_at: timestamp.toISOString(),
    hive_sensor_id: sourceRow.tag_number,
    beehub_name: sourceRow.beehub_name,
    temperature: parseFloat(sourceRow.temperature ?? (Math.random() * 15 + 15)).toFixed(2),
    humidity: parseFloat(sourceRow.humidity ?? (Math.random() * 30 + 40)).toFixed(2),
    hive_power: parseFloat(sourceRow.hive_power ?? (Math.random() * 50 + 100)).toFixed(2),
    audio_density: parseFloat(sourceRow.audio_density ?? (Math.random() * 10 + 5)).toFixed(2),
    audio_density_ratio: parseFloat(sourceRow.audio_density_ratio ?? (Math.random())).toFixed(2),
    density_variation: parseFloat(sourceRow.density_variation ?? (Math.random() * 5)).toFixed(2),
    is_test_data: true
  });

  await record.validate(); 

  return record.toJSON();
}

// Main
(async () => {
  console.log('Starting synthetic data generation....');

  // Load source CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on('data', (row) => {
        sourceRows.push(row);
      })
      .on('end', () => {
        console.log(`Loaded ${sourceRows.length} source rows`);
        resolve();
      })
      .on('error', (error) => {
        console.error('CSV reading error:', error);
        reject(error);
      });
  });

  // Create synthetic rows
  for (let i = 0; i < totalRecords; i++) {
    const sourceRow = sourceRows[i % sourceRows.length];

    try {
      const newRow = await createValidatedHiveObservation(sourceRow, currentTimestamp);
      outputRows.push(newRow);
    } catch (error) {
      console.error(`Validation error, record ${i}:`, error);
      process.exit(1); // fail fast if invalid
    }

    currentTimestamp = currentTimestamp.add(incrementMinutes, 'minute');
  }

  // Step 3: Save final JSON
  fs.writeFileSync(outputFile, JSON.stringify(outputRows, null, 2), 'utf8');

  console.log(`Success, generated ${outputRows.length} records at location: ${outputFile}`);
})();