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
const outputFile = path.join(__dirname, 'synthetic_100000_from_csv.json');
const totalRecords = 10000;
const incrementMinutes = 5;

//let currentTimestamp = dayjs('2023-04-15T00:59:35+02:00');
//2023-06-18T01:35:35.000Z
let currentTimestamp = dayjs('2023-06-18T10:15:35+02:00').add(5, 'minute');
//2023-04-18T10:14:35.000Z

const sourceRows = [];
const outputRows = [];

// builds and validate each row
async function createValidatedHiveObservation(sourceRow, timestamp) {
  const parsed = {
    published_at: timestamp.toISOString(),
    hive_sensor_id: parseInt(sourceRow.tag_number),
    beehub_name: sourceRow.beehub_name,
    temperature: parseFloat(sourceRow.temperature ?? (Math.random() * 15 + 15)),
    humidity: parseFloat(sourceRow.humidity ?? (Math.random() * 30 + 40)),
    hive_power: parseFloat(sourceRow.hive_power ?? (Math.random() * 50 + 100) * -1),
    audio_density: parseFloat(sourceRow.audio_density ?? (Math.random() * 10 + 5)),
    audio_density_ratio: parseFloat(sourceRow.audio_density_ratio ?? Math.random()),
    density_variation: parseFloat(sourceRow.density_variation ?? (Math.random() * 5)),
    lat: 0,
    long: 0,
    geolocation: {
      type: 'Point',
      coordinates: [0, 0]
    },
    is_test_data: true,

    // 16 frequency bands (mocked with noise or pulled from CSV if present)
    hz_122_0703125: parseFloat(sourceRow.hz_122_0703125 ?? (Math.random() * 10 - 5)),
    hz_152_587890625: parseFloat(sourceRow.hz_152_587890625 ?? (Math.random() * 10 - 5)),
    hz_183_10546875: parseFloat(sourceRow.hz_183_10546875 ?? (Math.random() * 10 - 5)),
    hz_213_623046875: parseFloat(sourceRow.hz_213_623046875 ?? (Math.random() * 10 - 5)),
    hz_244_140625: parseFloat(sourceRow.hz_244_140625 ?? (Math.random() * 10 - 5)),
    hz_274_658203125: parseFloat(sourceRow.hz_274_658203125 ?? (Math.random() * 10 - 5)),
    hz_305_17578125: parseFloat(sourceRow.hz_305_17578125 ?? (Math.random() * 10 - 5)),
    hz_335_693359375: parseFloat(sourceRow.hz_335_693359375 ?? (Math.random() * 10 - 5)),
    hz_366_2109375: parseFloat(sourceRow.hz_366_2109375 ?? (Math.random() * 10 - 5)),
    hz_396_728515625: parseFloat(sourceRow.hz_396_728515625 ?? (Math.random() * 10 - 5)),
    hz_427_24609375: parseFloat(sourceRow.hz_427_24609375 ?? (Math.random() * 10 - 5)),
    hz_457_763671875: parseFloat(sourceRow.hz_457_763671875 ?? (Math.random() * 10 - 5)),
    hz_488_28125: parseFloat(sourceRow.hz_488_28125 ?? (Math.random() * 10 - 5)),
    hz_518_798828125: parseFloat(sourceRow.hz_518_798828125 ?? (Math.random() * 10 - 5)),
    hz_549_31640625: parseFloat(sourceRow.hz_549_31640625 ?? (Math.random() * 10 - 5)),
    hz_579_833984375: parseFloat(sourceRow.hz_579_833984375 ?? (Math.random() * 10 - 5))
  };

  const record = HiveObservation.build(parsed);
  await record.validate();
  return parsed; // not record.toJSON() — we control the format directly
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