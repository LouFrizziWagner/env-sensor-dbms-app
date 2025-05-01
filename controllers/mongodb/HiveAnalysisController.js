import HiveObservation from "../../models/mysql/HiveObservation.js";
import { Op, QueryTypes } from "sequelize"; 
import Sequelize from "../../config/mysql-config.js";

// Get distinct Hive Sensors
// bulk read 1000
// Bulk read 10 000
// bulk read 100.000

// Test get for preview
export const getMongodbTestHiveObservations = async (req, res) => {
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