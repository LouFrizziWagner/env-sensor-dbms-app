import HiveObservation from "../../models/mysql/HiveObservation.js";
import { Op, QueryTypes } from "sequelize"; 
import Sequelize from "../../config/mysql-config.js";

export const getLastFiveObservations = async (req, res) => {
  try {
    const results = await HiveObservation.findAll({
      limit: 5,
      order: [['published_at', 'DESC']],
      raw: true
    });

    const transformedResults = results.map(entry => {
      const date = new Date(entry.published_at);
      const formattedDate = date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return {
        ...entry,
        published_at_formatted: formattedDate,
        geolocation_lat: entry.geolocation?.coordinates?.[1] ?? null,
        geolocation_long: entry.geolocation?.coordinates?.[0] ?? null,
      };
    });

    return res.status(200).json({
      message: 'Get 5 latest hive observations',
      data: transformedResults
    });
  } catch (error) {
    console.error('getLastFiveObservations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFirstFiveObservations = async (req, res) => {
  try {
    const results = await HiveObservation.findAll({
      limit: 5,
      order: [['published_at', 'ASC']],
      raw: true
    });

    const transformedResults = results.map(entry => {
      const date = new Date(entry.published_at);
      const formattedDate = date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      return {
        ...entry,
        published_at_formatted: formattedDate,
        geolocation_lat: entry.geolocation?.coordinates?.[1] ?? null,
        geolocation_long: entry.geolocation?.coordinates?.[0] ?? null,
      };
    });

    return res.status(200).json({
      message: 'Get 5 oldest hive observations',
      data: transformedResults
    });
  } catch (error) {
    console.error('getFirstFiveObservations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllBeehubNames = async (req, res) => {
  try {
    const results = await HiveObservation.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('beehub_name')), 'beehub_name']
      ],
      raw: true
    });

    return res.status(200).json({ beehub_name: results.map(r => r.beehub_name) });
  } catch (error) {
    console.error('beehub-names error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
  
export const getDistinctHiveSensors = async (req, res) => {
  try {
    const results = await HiveObservation.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('hive_sensor_id')), 'hive_sensor_id']
      ],
      raw: true
    });

    return res.status(200).json({
      hive_sensor_ids: results.map(r => r.hive_sensor_id)
    });
  } catch (error) {
    console.error('hive_sensor_id error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// One Thousand
export const bulkReadOneThousandHiveObservations = async (req, res) => {
  try {
    const results = await HiveObservation.findAll({
      limit: 1000,
      order: [['published_at', 'DESC']], // latest first
      raw: true
    });

    return res.status(200).json({
      message: 'Bulk read of 1000 hive observations',
      data: results
    });
  } catch (error) {
    console.error('bulkReadOneThousandHiveObservations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const bulkReadFiveThousandHiveObservations = async (req, res) => {
  try {
    const results = await HiveObservation.findAll({
      limit: 5000,
      order: [['published_at', 'DESC']], // latest first
      raw: true
    });

    return res.status(200).json({
      message: 'Bulk read of 5000 hive observations',
      data: results
    });
  } catch (error) {
    console.error('bulkReadFiveThousandHiveObservations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

  //Ten Thousand
  export const bulkReadTenThousandHiveObservations = async (req, res) => {
    try {
      const results = await HiveObservation.findAll({
        limit: 10000,
        order: [['published_at', 'DESC']], // latest first
        raw: true
      });
  
      return res.status(200).json({
        message: 'Bulk read of 10000 hive observations',
        data: results
      });
    } catch (error) {
      console.error('bulkReadOneThousandHiveObservations error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Twenty thousand
  export const bulkReadTwentyThousandHiveObservations = async (req, res) => {
    try {
      const results = await HiveObservation.findAll({
        limit: 20000,
        order: [['published_at', 'DESC']], // latest first
        raw: true
      });
  
      return res.status(200).json({
        message: 'Bulk read of 20.000 hive observations',
        data: results
      });
    } catch (error) {
      console.error('bulkReadTwentyThousandHiveObservations error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const bulkReadOneHundredThousandHiveObservations = async (req, res) => {
    try {
      const results = await HiveObservation.findAll({
        limit: 100000,
        order: [['published_at', 'DESC']], // latest first
        raw: true
      });
  
      return res.status(200).json({
        message: 'Bulk read of 100,000 hive observations',
        data: results
      });
    } catch (error) {
      console.error('bulkReadOneHundredThousandHiveObservations error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const insertSingleHiveObservation = async (req, res) => {
    try {
      const newObservation = req.body;
  
      if (!newObservation.published_at || !newObservation.hive_sensor_id) {
        return res.status(400).json({ error: 'Missing required fields: published_at and hive_sensor_id.' });
      }
  
      await HiveObservation.create(newObservation);
  
      return res.status(201).json({ message: 'Single observation inserted successfully.' });
    } catch (error) {
      console.error('insertSingleHiveObservation error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };


/** Calculating time differences in minutes between consecutive observations grouped by hive_sensor_id. (Time Range D1 - D2 )*/
export const getTimeDifferencesBetweenObservations = async (req, res) => {
  try {
    const start = '2020-04-16';
    const end = '2020-04-30';

    const results = await Sequelize.query(`
      SELECT 
        hive_sensor_id,
        published_at,
        TIMESTAMPDIFF(MINUTE,
          LAG(published_at) OVER (PARTITION BY hive_sensor_id ORDER BY published_at ASC),
          published_at
        ) AS minutes_between
      FROM hive_observations
      WHERE published_at BETWEEN :start AND :end
      ORDER BY hive_sensor_id ASC, published_at ASC;
    `, {
      replacements: { start, end },
      type: QueryTypes.SELECT,
    });

    return res.status(200).json({ message: 'Time differences between observations', data: results });
  } catch (error) {
    console.error('getTimeDifferencesBetweenObservations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Test get for preview
export const getMysqlTestHiveObservations = async (req, res) => {
  try {
    console.log('getMysqlTestHiveObservations route hit');

    const data = await HiveObservation.findAll({
      limit: 20,
      order: [['published_at', 'DESC']],
      raw: true,
    });
    // Log the first row
    console.log('DB result sample:', data.slice(0, 1)); 

    return res.status(200).json({
      message: 'Fetched from DB',
      data
    });
  } catch (error) {
    console.error('getMysqlTestHiveObservations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// delete for test inserts
export const deleteMostRecentObservation = async (req, res) => {
  try {
    const latest = await HiveObservation.findOne({
      order: [['published_at', 'DESC']]
    });

    if (!latest) {
      return res.status(404).json({ message: 'No observations found to delete.' });
    }

    await latest.destroy();

    return res.status(200).json({
      message: 'Most recent observation deleted.',
      deletedId: latest.id,
      deletedTimestamp: latest.published_at
    });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: 'Failed to delete the most recent observation.' });
  }
};