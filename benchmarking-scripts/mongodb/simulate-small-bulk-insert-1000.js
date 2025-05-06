/** Simulate Small Bulk Insert directly to MySQL using Sequelize */
/** 
 * 1,000 synthetic sensor observations
 * 1 observation per 60 seconds (simulated)
 * ~16.67 hours of sensor data (synthetic timeline) */

import HiveObservation from '../../models/mongodb/HiveObservation.js';
import { connectMongo, disconnectMongo } from '../../config/mongo-config.js';

// === Configuration ===
const hive_sensor_ids = [200602, 201700, 200599, 200828];
const beehub_names = ['nectar-bh131', 'nectar-bh121'];

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

function generateObservations(baseTimestamp, intervalSeconds) {
  const selectedHiveId = hive_sensor_ids[Math.floor(Math.random() * hive_sensor_ids.length)];
  const selectedBeehub = beehub_names[Math.floor(Math.random() * beehub_names.length)];

  const obs = [];

  for (let i = 0; i < 1000; i++) {
    const timestamp = new Date(baseTimestamp.getTime() + i * intervalSeconds * 1000);

    obs.push({
      published_at: timestamp,
      date: timestamp,
      time: timestamp.toISOString().slice(11, 19),
      temperature: parseFloat((Math.random() * 5 + 25).toFixed(2)),
      humidity: parseFloat((Math.random() * 20 + 40).toFixed(2)),
      hive_sensor_id: selectedHiveId,
      beehub_name: selectedBeehub,
      lat: 52.52,
      long: 13.405,
      geolocation: {
        type: 'Point',
        coordinates: [13.405, 52.52]
      },
      hive_power: parseFloat((Math.random() * 10 + 90).toFixed(2)),
      audio_density: parseFloat((Math.random() * 10).toFixed(2)),
      audio_density_ratio: parseFloat((Math.random()).toFixed(3)),
      density_variation: parseFloat((Math.random() * 0.2).toFixed(3)),
      is_test_data: true,
      ...generateFrequencies()
    });
  }

  return obs;
}

async function run() {
  const baseTime = new Date();
  const interval = 60;

  const memStart = process.memoryUsage();
  const cpuStart = process.cpuUsage();

  try {
    await connectMongo();
    console.log('Connected via mongo-config.js');

    console.time('bulkInsert');
    const observations = generateObservations(baseTime, interval);

    const result = await HiveObservation.insertMany(observations, { ordered: false });
    console.timeEnd('bulkInsert');
    console.log(`+++ Inserted ${result.length} observations.`);
  } catch (err) {
    console.error('--- Bulk insert failed:', err.message);
  } finally {
    await disconnectMongo?.();
    console.log('Disconnected');

    // Log resource usage after insert completes
    const memEnd = process.memoryUsage();
    const cpuEnd = process.cpuUsage(cpuStart);

    console.log('\n=== Resource Usage Summary ===');
    console.log(`Memory RSS: ${(memEnd.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Heap Used: ${(memEnd.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`CPU Time: User ${cpuEnd.user / 1000}ms | System ${cpuEnd.system / 1000}ms`);
  }
}

run();