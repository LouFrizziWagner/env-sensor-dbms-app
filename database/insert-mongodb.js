import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectMongoDB } from '../config/mongodb-config.js';
import HiveObservation from '../models/mongodb/HiveObservation.js';

dotenv.config();
// D1_sensor_data.csv, D2_sensor_data.csv + 4 synthetic sensor observations
//const csvFilePath = path.resolve('database', 'data', 'D6_sensor_data_synthetic.csv');
const csvFilePath = path.resolve('database', 'data', 'D6_sensor_data_synthetic.csv');

const csvFileName = path.parse(csvFilePath).name; 

// Helpers
const fixFieldName = (str) => str.replace(/\./g, '_');
const parseBoolean = (value) => typeof value === 'string' ? value.toLowerCase() === 'true' : Boolean(value);

// Load and Transform from CSV
async function parseCSV(filePath, lastPublishedAtInDB = null, log = console.log) {
  return new Promise((resolve, reject) => {
    const results = [];
    const skippedRows = [];
    let parsedRows = 0;
    let skippedDueToTimestamp = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          if (!row.published_at) {
            log('Missing published_at, skipping row.');
            skippedRows.push(row);
            return;
          }

          const publishedAtDate = new Date(row.published_at);

          if (lastPublishedAtInDB && publishedAtDate <= lastPublishedAtInDB) {
            skippedDueToTimestamp++;
            return;
          }

          const parsed = {
            published_at: publishedAtDate,
            temperature: parseFloat(row.temperature),
            humidity: parseFloat(row.humidity),
            hive_sensor_id: parseInt(row.tag_number),
            beehub_name: row.beehub_name,
            geolocation: {
              type: 'Point',
              coordinates: [
                parseFloat(row.long) || 0,
                parseFloat(row.lat) || 0
              ]
            },
            lat: parseFloat(row.lat),
            long: parseFloat(row.long),
            hive_power: parseFloat(row.hive_power),
            date: new Date(row.date),
            time: row.time,
            audio_density: parseFloat(row.audio_density),
            audio_density_ratio: parseFloat(row.audio_density_ratio),
            density_variation: parseFloat(row.density_variation),
            is_test_data: parseBoolean(row.is_test_data)
          };

          for (const key in row) {
            if (key.startsWith('hz_')) {
              const safeKey = fixFieldName(key);
              parsed[safeKey] = parseFloat(row[key]);
            }
          }

          results.push(parsed);
          parsedRows++;

          if (parsedRows % 10000 === 0) {
            log(`Parsed ${parsedRows} rows...`);
          }
        } catch (err) {
          log('Error parsing row: ' + err.stack);
        }
      })
      .on('end', () => {
        log(`Finished parsing CSV. Parsed: ${parsedRows} rows, Skipped due to timestamp: ${skippedDueToTimestamp}, Skipped missing fields: ${skippedRows.length}`);
        resolve({
          parsedRows,
          skippedDueToTimestamp,
          skippedMissingFields: skippedRows.length,
          parsedDocuments: results
        });
      })
      .on('error', reject);
  });
}

// Insert parsed documents into MongoDB in batches
async function insertBatches(data, batchSize = 1000, log = console.log) {
  let totalInserted = 0;
  let totalDuplicates = 0;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    log(`Inserting batch ${i / batchSize + 1} (${batch.length} documents)...`);

    try {
      await HiveObservation.insertMany(batch, { ordered: false });
      totalInserted += batch.length;
    } catch (error) {
      if (error.name === 'BulkWriteError') {
        const duplicateErrors = error.writeErrors.filter(e => e.code === 11000);
        totalDuplicates += duplicateErrors.length;
        totalInserted += (batch.length - duplicateErrors.length);
        log(`Batch insert completed with ${duplicateErrors.length} duplicates skipped.`);
      } else {
        log('Unexpected error during insert: ' + error.stack);
      }
    }
  }

  log(`Finished seeding. Inserted: ${totalInserted}, skipped duplicates: ${totalDuplicates}`);
}

// Insert via mongoose ODL to the mongodb collection
async function seedMongoDB() {
  await connectMongoDB();

  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const logFilePath = path.resolve('database', 'logs', `${csvFileName}-seed-log-${timestamp}.log`);
  const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

  function log(message) {
    console.log(message);
    logStream.write(message + '\n');
  }

  const countBefore = await HiveObservation.countDocuments();
  log(`Documents in collection BEFORE seeding: ${countBefore}`);

  try {
    const latestDoc = await HiveObservation.findOne().sort({ published_at: -1 }).select('published_at');
    const lastPublishedAtInDB = latestDoc?.published_at || null;

    if (lastPublishedAtInDB) {
      log(`Last published_at in database: ${lastPublishedAtInDB.toISOString()}`);
    } else {
      log('Collection is empty, starting full seeding process...');
    }

    const parseResult = await parseCSV(csvFilePath, lastPublishedAtInDB, log);
    const { parsedRows, skippedDueToTimestamp, skippedMissingFields, parsedDocuments } = parseResult;

    if (parsedDocuments.length === 0) {
      log('No new data to insert.');
    } else {
      await insertBatches(parsedDocuments, 1000, log);
    }
    const countAfter = await HiveObservation.countDocuments();
    log('-------------------------------');
    log(' Seeding Summary');
    log(` - Documents before:           ${countBefore}`);
    log(` - Documents after:            ${countAfter}`);
    log(` - Documents added:            ${countAfter - countBefore}`);
    log('-------------------------------');

  } catch (err) {
    log('Seeding failed: ' + err.stack);
  } finally {
    await mongoose.disconnect();
    log('MongoDB connection closed.');
    logStream.end();
  }
  
}

seedMongoDB();