import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import moment from 'moment';
import dotenv from 'dotenv';
import sequelize from '../config/mysql-config.js';
import HiveObservation from '../models/mysql/HiveObservation.js';

dotenv.config();

// Summer sensor data: D1_sensor_data.csv, 
// Winter sensor data: D2_sensor_data.csv
// const csvFilePath = path.join('database', 'data', 'D6_sensor_data_synthetic.csv');
const csvFilePath = path.join('database', 'data', 'D6_sensor_data_synthetic.csv');

const BATCH_SIZE = 1000;

// Helper Methods
const safeFloat = val => {
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

const safeInt = val => {
  const num = parseInt(val);
  return isNaN(num) ? null : num;
};

const safeDate = (val, format) => {
  const m = moment(val, format, true);
  return m.isValid() ? m.format('YYYY-MM-DD') : null;
};

const safeTime = val => {
  const m = moment(val, 'HH:mm:ss', true);
  return m.isValid() ? m.format('HH:mm:ss') : null;
};

const parsePointWKT = wkt => {
  const match = /POINT\s*\(\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*\)/i.exec(wkt);
  if (!match) return null;
  const [, lng, lat] = match.map(Number);
  return { type: 'Point', coordinates: [lng, lat] };
};

const toBoolean = val => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const lower = val.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  }
  return false; // fallback if value is missing, invalid, or not boolean
};

const transformRow = row => ({
  published_at: new Date(row.published_at),
  temperature: safeFloat(row.temperature),
  humidity: safeFloat(row.humidity),
  hive_sensor_id: safeInt(row['tag_number']),
  beehub_name: row.beehub_name,
  geolocation: parsePointWKT(row.geolocation), 
  lat: safeFloat(row.lat),
  long: safeFloat(row.long),
  hive_power: safeFloat(row.hive_power),
  date: safeDate(row.date, 'M/D/YY'),
  time: safeTime(row.time),
  hz_122_0703125: safeFloat(row['hz_122.0703125']),
  hz_152_587890625: safeFloat(row['hz_152.587890625']),
  hz_183_10546875: safeFloat(row['hz_183.10546875']),
  hz_213_623046875: safeFloat(row['hz_213.623046875']),
  hz_244_140625: safeFloat(row['hz_244.140625']),
  hz_274_658203125: safeFloat(row['hz_274.658203125']),
  hz_305_17578125: safeFloat(row['hz_305.17578125']),
  hz_335_693359375: safeFloat(row['hz_335.693359375']),
  hz_366_2109375: safeFloat(row['hz_366.2109375']),
  hz_396_728515625: safeFloat(row['hz_396.728515625']),
  hz_427_24609375: safeFloat(row['hz_427.24609375']),
  hz_457_763671875: safeFloat(row['hz_457.763671875']),
  hz_488_28125: safeFloat(row['hz_488.28125']),
  hz_518_798828125: safeFloat(row['hz_518.798828125']),
  hz_549_31640625: safeFloat(row['hz_549.31640625']),
  hz_579_833984375: safeFloat(row['hz_579.833984375']),
  audio_density: safeFloat(row.audio_density),
  audio_density_ratio: safeFloat(row.audio_density_ratio),
  density_variation: safeFloat(row.density_variation),
  is_test_data: toBoolean(row.is_test_data)
});

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('\n Connected to MySQL...');

    // Check if table exists
    const [results] = await sequelize.query(`
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = 'hive_sensor_data_benchmark'
      AND table_name = 'hive_observations';
    `);

    if (results[0].count === 0) {
      console.log('Table does not exist, creating...');
      await sequelize.query(`
        CREATE TABLE hive_observations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          published_at DATETIME NOT NULL,
          temperature FLOAT DEFAULT NULL,
          humidity FLOAT DEFAULT NULL,
          hive_sensor_id INT NOT NULL,
          beehub_name VARCHAR(255) NOT NULL,
          geolocation POINT DEFAULT NULL,
          lat FLOAT DEFAULT NULL,
          \`long\` FLOAT DEFAULT NULL,
          hive_power FLOAT DEFAULT NULL,
          date DATE DEFAULT NULL,
          time TIME DEFAULT NULL,
          hz_122_0703125 FLOAT DEFAULT NULL,
          hz_152_587890625 FLOAT DEFAULT NULL,
          hz_183_10546875 FLOAT DEFAULT NULL,
          hz_213_623046875 FLOAT DEFAULT NULL,
          hz_244_140625 FLOAT DEFAULT NULL,
          hz_274_658203125 FLOAT DEFAULT NULL,
          hz_305_17578125 FLOAT DEFAULT NULL,
          hz_335_693359375 FLOAT DEFAULT NULL,
          hz_366_2109375 FLOAT DEFAULT NULL,
          hz_396_728515625 FLOAT DEFAULT NULL,
          hz_427_24609375 FLOAT DEFAULT NULL,
          hz_457_763671875 FLOAT DEFAULT NULL,
          hz_488_28125 FLOAT DEFAULT NULL,
          hz_518_798828125 FLOAT DEFAULT NULL,
          hz_549_31640625 FLOAT DEFAULT NULL,
          hz_579_833984375 FLOAT DEFAULT NULL,
          audio_density FLOAT DEFAULT NULL,
          audio_density_ratio FLOAT DEFAULT NULL,
          density_variation FLOAT DEFAULT NULL,
          is_test_data BOOLEAN DEFAULT FALSE,
          INDEX idx_published_at (published_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('\n Table hive_observations created.');
    } else {
      console.log('\n Table hive_observations already exists.');
    }

    const records = [];
    let totalCount = 0;
    let skippedCount = 0;

    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', async row => {
          const transformed = transformRow(row);

          if (transformed.hive_sensor_id === null) {
            skippedCount++;
            return;
          }

          records.push(transformed);
          totalCount++;

          if (records.length === BATCH_SIZE) {
            stream.pause();
            try {
              await HiveObservation.bulkCreate(records, { validate: true });
              console.log(`\n Inserted batch of ${records.length}`);
              records.length = 0;
              stream.resume();
            } catch (err) {
              console.error('\n Insert batch failed:', err);
              stream.destroy(err);
              reject(err);
            }
          }
        })
        .on('end', async () => {
          if (records.length) {
            try {
              await HiveObservation.bulkCreate(records, { validate: true });
              console.log(`\n Inserted final batch of ${records.length}`);
            } catch (err) {
              console.error('\n Final batch failed:', err);
            }
          }
          resolve();
        })
        .on('error', reject);
    });

    console.log(`\n CSV import complete. Inserted: ${totalCount}, Skipped: ${skippedCount}`);
  } catch (error) {
    console.error('\n Seeding error:', error);
  } finally {
    await sequelize.close();
    console.log('\n Connection closed.');
  }
};

seed();