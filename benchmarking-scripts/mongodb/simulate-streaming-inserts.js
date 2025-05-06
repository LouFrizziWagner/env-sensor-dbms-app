/**
 * Simulate real-time insert to MongoDB using Mongoose
 * 1 insert per second
 * Over a 30-minute duration
 * Total: 1,800 rows
 */

import HiveObservation from '../../models/mongodb/HiveObservation.js';
import { connectMongo, disconnectMongo } from '../../config/mongo-config.js';

const hive_sensor_ids = [200602, 201700, 200599, 200828];
const beehub_names = ['nectar-bh131', 'nectar-bh121'];

const INTERVAL_MS = 1000;        // 1 insert per second
const TOTAL_DURATION_MIN = 30;   // 30 minutes
const TOTAL_INSERTS = TOTAL_DURATION_MIN * 60;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateFrequencies() {
  const freqs = {};
  const keys = [
    'hz_122_0703125', 'hz_152_587890625', 'hz_183_10546875', 'hz_213_623046875',
    'hz_244_140625', 'hz_274_658203125', 'hz_305_17578125', 'hz_335_693359375',
    'hz_366_2109375', 'hz_396_728515625', 'hz_427_24609375', 'hz_457_763671875',
    'hz_488_28125', 'hz_518_798828125', 'hz_549_31640625', 'hz_579_833984375'
  ];
  for (const key of keys) {
    freqs[key] = parseFloat((Math.random() * 100).toFixed(3));
  }
  return freqs;
}

function generateObservation(timestamp) {
  const hive_sensor_id = hive_sensor_ids[Math.floor(Math.random() * hive_sensor_ids.length)];
  const beehub_name = beehub_names[Math.floor(Math.random() * beehub_names.length)];
  const lat = 52.52;
  const long = 13.405;

  return {
    published_at: timestamp,
    date: timestamp,
    time: timestamp.toISOString().slice(11, 19),
    temperature: parseFloat((Math.random() * 5 + 25).toFixed(2)),
    humidity: parseFloat((Math.random() * 20 + 40).toFixed(2)),
    hive_sensor_id,
    beehub_name,
    lat,
    long,
    geolocation: {
      type: 'Point',
      coordinates: [long, lat]
    },
    hive_power: parseFloat((Math.random() * 10 + 90).toFixed(2)),
    audio_density: parseFloat((Math.random() * 10).toFixed(2)),
    audio_density_ratio: parseFloat((Math.random()).toFixed(3)),
    density_variation: parseFloat((Math.random() * 0.2).toFixed(3)),
    is_test_data: true,
    ...generateFrequencies()
  };
}

async function run() {
  console.log(`⏱️ Starting 30-minute streaming insert benchmark...`);
  console.time('🕒 Total Insert Time');

  let successCount = 0;
  let failureCount = 0;
  const baseTime = new Date();

  try {
    await connectMongo();
    console.log('Connected to MongoDB');

    for (let i = 0; i < TOTAL_INSERTS; i++) {
      const timestamp = new Date(baseTime.getTime() + i * INTERVAL_MS);
      const observation = generateObservation(timestamp);

      try {
        await HiveObservation.create(observation);
        successCount++;
      } catch {
        failureCount++;
      }

      await sleep(INTERVAL_MS);
    }

    console.timeEnd('+++ Total Insert Time');
    console.log(`+++ Successful inserts: ${successCount}`);
    console.log(`Failed inserts:     ${failureCount}`);
  } catch (err) {
    console.error('Connection or insert error:', err.message);
  } finally {
    await disconnectMongo?.();
    console.log('Disconnected from MongoDB');
  }
}

run();