import HiveObservation from "../../models/mysql/HiveObservation.js";
import { Op, QueryTypes } from "sequelize"; 
import Sequelize from "../../config/mysql-config.js";

    
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

    const inserted = await HiveObservation.create({
      ...data,
      geolocation: geo,
      date: publishedDate.toISOString().slice(0, 10),
      time: publishedDate.toISOString().slice(11, 19),
      is_test_data: data.is_test_data === true
    });

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
export const bulkInsertAfterOffline = async (req, res) => {
  try {
    const observations = req.body;

    if (!Array.isArray(observations) || observations.length === 0) {
      return res.status(400).json({ error: 'Request body must be a non empty array of observations.' });
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
        date: publishedDate.toISOString().slice(0, 10),
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

    const result = await HiveObservation.bulkCreate(transformed, { validate: true });

    return res.status(201).json({
      message: `Successfully inserted ${result.length} offline observations.`,
      insertedCount: result.length
    });
  } catch (error) {
    console.error('Offline bulk insert error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



// Loop Create Insert

// Bulk Insert
export async function bulkInsertObservations(observations) {
  try {
    await HiveObservation.bulkCreate(observations, {
      validate: true
    });
    console.log(`Inserted ${observations.length} observations.`);
  } catch (error) {
    console.error('Failed to bulk insert observations:', error);
    throw error;
  }
}

//Bulk Insert with transaction
export async function bulkInsertObservationsAtomicity(observations) {
    const transaction = await sequelize.transaction();
    try {
      await HiveObservation.bulkCreate(observations, {
        validate: true,
        transaction
      });
      await transaction.commit();
      console.log(`Inserted ${observations.length} observations committed.`);
    } catch (error) {
      await transaction.rollback();
      console.error('Failed to bulk insert observations and rolled back:', error);
      throw error; 
    }
  }
  
// Simulate with sleep 
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function simulateSensorInsertion(observations, batchSize = 100, delayMs = 1000) {
  const total = observations.length;
  let currentIndex = 0;

  while (currentIndex < total) {
    const batch = observations.slice(currentIndex, currentIndex + batchSize);

    const transaction = await sequelize.transaction();
    try {
      await HiveObservation.bulkCreate(batch, { validate: true, transaction });
      await transaction.commit();
      console.log(`\n Batch ${currentIndex / batchSize + 1}: Inserted ${batch.length} observations`);
    } catch (error) {
      await transaction.rollback();
      console.error(`Batch ${currentIndex / batchSize + 1}: Error, rolling back.`);
      throw error; // stop everything on first error
    }

    currentIndex += batchSize;

    if (currentIndex < total) {
      console.log(`...Sleeping for ${delayMs} ms before the next batch...`);
      await sleep(delayMs);
    }
  }

  console.log('\n Sensor data simulation completed.');
}

//Bulk insert batch size 2
async function insertTwoBatches(req, res) {
  const { observations } = req.body;

  if (!observations || !Array.isArray(observations) || observations.length === 0) {
    return res.status(400).json({ message: 'Invalid observations array.' });
  }

  const batchSize = Math.ceil(observations.length / 2);

  try {
    for (let i = 0; i < observations.length; i += batchSize) {
      const batch = observations.slice(i, i + batchSize);
      const transaction = await sequelize.transaction();
      await HiveObservation.bulkCreate(batch, { validate: true, transaction });
      await transaction.commit();
      console.log(`✅ Inserted batch of ${batch.length} observations (2 batch mode)`);
    }

    res.status(200).json({ message: 'Inserted in 2 batches successfully.' });
  } catch (error) {
    console.error('❌ Error inserting 2 batches:', error);
    res.status(500).json({ message: 'Error inserting 2 batches.', error: error.message });
  }
}