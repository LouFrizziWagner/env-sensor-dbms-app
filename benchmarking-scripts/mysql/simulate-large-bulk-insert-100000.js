/** Simulate Large Bulk Insert directly to MySQL using Sequelize */
/** 
 * 100,000 rows total
 * batches of 10,000 rows per insert
 * with timestamps spaced 60 seconds apart */

import HiveObservation from '../../models/mysql/HiveObservation.js';
import sequelize from '../../config/mysql-config.js';

// === Configuration ===
const hive_sensor_ids = [200602, 201700, 200599, 200828];
const beehub_names = ['nectar-bh131', 'nectar-bh121'];

const DEFAULT_TOTAL = 100000;
const DEFAULT_BATCH = 10000;
const INTERVAL_SECONDS = 60;

// === Utility: Generate realistic frequency fields ===
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

// === Generate N synthetic observations with time offset ===
function generateObservations(baseTime, intervalSeconds, startOffset, count) {
  const selectedHiveId = hive_sensor_ids[Math.floor(Math.random() * hive_sensor_ids.length)];
  const selectedBeehub = beehub_names[Math.floor(Math.random() * beehub_names.length)];

  const observations = [];

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(baseTime.getTime() + (startOffset + i) * intervalSeconds * 1000);

    observations.push({
      published_at: timestamp,
      date: timestamp.toISOString().slice(0, 10),
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

  return observations;
}

// === Main runner ===
async function run() {
  const total = parseInt(process.argv[2] || DEFAULT_TOTAL);
  const batchSize = parseInt(process.argv[3] || DEFAULT_BATCH);
  const baseTime = new Date();
  // Log resource usage after insert completes
  const memEnd = process.memoryUsage();
  const cpuEnd = process.cpuUsage(cpuStart);
  

  console.log(`Starting the bulk insert benchmark script`);
  console.log(`Total rows: ${total}, Batch size: ${batchSize}`);
  console.time('Total Insert Time');

  try {
    for (let offset = 0; offset < total; offset += batchSize) {
      const currentBatchSize = Math.min(batchSize, total - offset);
      const observations = generateObservations(baseTime, INTERVAL_SECONDS, offset, currentBatchSize);

      const inserted = await HiveObservation.bulkCreate(observations, {
        validate: false,            // turn on if needed
        ignoreDuplicates: true      // safe for replayed inserts
      });

      console.log(`Inserted batch: ${inserted.length} rows (offset: ${offset})`);
    }

    console.timeEnd('Total Insert Time');
  } catch (err) {
    console.error('Insert failed:', err);
  } finally {
    await sequelize.close();
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