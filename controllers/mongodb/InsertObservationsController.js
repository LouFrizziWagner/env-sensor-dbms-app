import HiveObservation from "../../models/mongodb/HiveObservation.js";

    
// Single Observation Create simple 
export const insertSingleObservation = async (req, res) => {
  try {
    const data = req.body;

    const geo = data.geolocation || (
      data.lat != null && data.long != null
        ? { type: 'Point', coordinates: [parseFloat(data.long), parseFloat(data.lat)] }
        : null
    );

    const publishedDate = new Date(data.published_at);

    const observation = new HiveObservation({
      ...data,
      geolocation: geo,
      date: publishedDate.toISOString().slice(0, 10),
      time: publishedDate.toISOString().slice(11, 19),
      is_test_data: data.is_test_data === true
    });

    const inserted = await observation.save();

    return res.status(201).json({
      message: 'Observation inserted.',
      data: inserted
    });
  } catch (error) {
    console.error('Insert error:', error);
    return res.status(500).json({ error: 'Insert failed.' });
  }
};

// Simulate scenario: after offline, sensor bulk inserts to db
const hive_sensor_ids = [200602, 201700, 200599, 200828];
const beehub_names = ['nectar-bh131', 'nectar-bh121'];

export const simulateBulkInsertAfterOfflineFor60Minutes = async (req, res) => {
  try {
    const {
      outageMinutes = 60,
      frequencySeconds = 60,
      hive_sensor_id,
      beehub_name,
      lat = 52.52,
      long = 13.405,
      is_test_data = true,
      fakeData = null
    } = req.body;

    // Randomly pick valid IDs if none provided
    const selectedHiveId = hive_sensor_id ?? hive_sensor_ids[Math.floor(Math.random() * hive_sensor_ids.length)];
    const selectedBeehub = beehub_name ?? beehub_names[Math.floor(Math.random() * beehub_names.length)];

    const now = new Date();
    const count = Math.floor((outageMinutes * 60) / frequencySeconds);

    const observations = fakeData || Array.from({ length: count }).map((_, i) => {
      const timestamp = new Date(now.getTime() - (count - i) * frequencySeconds * 1000);
      const coords = [parseFloat(long), parseFloat(lat)];

      return {
        published_at: timestamp,
        date: timestamp,
        time: timestamp.toISOString().slice(11, 19),
        temperature: parseFloat((Math.random() * 5 + 25).toFixed(2)),
        humidity: parseFloat((Math.random() * 20 + 40).toFixed(2)),
        hive_sensor_id: selectedHiveId,
        beehub_name: selectedBeehub,
        lat,
        long,
        geolocation: {
          type: 'Point',
          coordinates: coords
        },
        hive_power: parseFloat((Math.random() * 10 + 90).toFixed(2)),
        audio_density: parseFloat((Math.random() * 10).toFixed(2)),
        audio_density_ratio: parseFloat((Math.random()).toFixed(3)),
        density_variation: parseFloat((Math.random() * 0.2).toFixed(3)),
        is_test_data,
        ...generateFrequencies()
      };
    });

    const inserted = await HiveObservation.insertMany(observations, { ordered: false });

    return res.status(201).json({
      message: `Inserted ${inserted.length} observations for hive_sensor_id ${selectedHiveId} at ${selectedBeehub}`,
      data: inserted
    });
  } catch (error) {
    console.error('Bulk insert error:', error);
    return res.status(500).json({ error: 'Bulk insert failed.', details: error.message });
  }
};

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

// Bulk insert with data in body (after offline scenario)
export const bulkInsertAfterOffline = async (req, res) => {
  try {
    const observations = req.body;

    if (!Array.isArray(observations) || observations.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non-empty array of observations.' });
    }

    const transformed = observations.map(obs => {
      const publishedDate = new Date(obs.published_at);

      const geolocation = obs.lat != null && obs.long != null
        ? { type: 'Point', coordinates: [parseFloat(obs.long), parseFloat(obs.lat)] }
        : null;

      return {
        published_at: publishedDate,
        temperature: obs.temperature,
        humidity: obs.humidity,
        hive_sensor_id: obs.hive_sensor_id,
        beehub_name: obs.beehub_name,
        lat: obs.lat,
        long: obs.long,
        geolocation,
        hive_power: obs.hive_power,
        audio_density: obs.audio_density,
        audio_density_ratio: obs.audio_density_ratio,
        density_variation: obs.density_variation,
        date: publishedDate,
        time: publishedDate.toISOString().slice(11, 19),
        is_test_data: obs.is_test_data ?? true,
        hz_122_0703125: obs.hz_122_0703125,
        hz_152_587890625: obs.hz_152_587890625,
        hz_183_10546875: obs.hz_183_10546875,
        hz_213_623046875: obs.hz_213_623046875,
        hz_244_140625: obs.hz_244_140625,
        hz_274_658203125: obs.hz_274_658203125,
        hz_305_17578125: obs.hz_305_17578125,
        hz_335_693359375: obs.hz_335_693359375,
        hz_366_2109375: obs.hz_366_2109375,
        hz_396_728515625: obs.hz_396_728515625,
        hz_427_24609375: obs.hz_427_24609375,
        hz_457_763671875: obs.hz_457_763671875,
        hz_488_28125: obs.hz_488_28125,
        hz_518_798828125: obs.hz_518_798828125,
        hz_549_31640625: obs.hz_549_31640625,
        hz_579_833984375: obs.hz_579_833984375
      };
    });

    const result = await HiveObservation.insertMany(transformed, { ordered: false });

    return res.status(201).json({
      message: `Successfully inserted ${result.length} offline observations.`,
      insertedCount: result.length
    });
  } catch (error) {
    console.error('Offline bulk insert error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Simulate with sleep 
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function simulateSensorInsertion(observations, batchSize = 100, delayMs = 1000) {
  const total = observations.length;
  let currentIndex = 0;

  try {
    await connectMongo();
    console.log(`Connected to MongoDB`);

    while (currentIndex < total) {
      const batch = observations.slice(currentIndex, currentIndex + batchSize);

      try {
        await HiveObservation.insertMany(batch, { ordered: false });
        console.log(`+++ Batch ${Math.floor(currentIndex / batchSize) + 1}: Inserted ${batch.length} observations`);
      } catch (error) {
        console.error(` ---- Batch ${Math.floor(currentIndex / batchSize) + 1} failed:`, error.message);
        // Continue to next batch instead of halting (optional behavior)
      }

      currentIndex += batchSize;

      if (currentIndex < total) {
        console.log(`...Sleeping for ${delayMs} ms before next batch...`);
        await sleep(delayMs);
      }
    }

    console.log('\nSensor data simulation completed.');
  } finally {
    await disconnectMongo?.();
    console.log('Disconnected from MongoDB');
  }
}

//** LATER POTENTIAL TESTING */
