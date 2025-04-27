import HiveObservation from "../../models/mysql/HiveObservation.js";
import { Op, QueryTypes } from "sequelize"; 
import Sequelize from "../../config/mysql-config.js";


/** Average Daily Humidity PerHive */
export const getAverageDailyHumidityPerHive = async (req, res) => {
    try {
      const results = await HiveObservation.findAll({
        attributes: [
          'hive_sensor_id',
          [Sequelize.fn('DATE', Sequelize.col('published_at')), 'day'],
          [Sequelize.fn('AVG', Sequelize.col('humidity')), 'avg_humidity']
        ],
        group: ['hive_sensor_id', Sequelize.fn('DATE', Sequelize.col('published_at'))],
        order: [
          ['hive_sensor_id', 'ASC'],
          [Sequelize.fn('DATE', Sequelize.col('published_at')), 'ASC']
        ],
        raw: true
      });
  
      return res.status(200).json({ message: 'Average daily humidity per hive', data: results });
    } catch (error) {
      console.error('getAverageDailyHumidityPerHive error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  /** Average Humidity for June 2021, returns one value */

  export const getAverageHumidityJune2021 = async (req, res) => {
    try {
      const result = await HiveObservation.findOne({
        attributes: [
          [Sequelize.fn('AVG', Sequelize.col('humidity')), 'avg_humidity']
        ],
        where: {
          published_at: {
            [Op.between]: ['2021-06-01T00:00:00Z', '2021-06-30T23:59:59Z']
          }
        },
        raw: true
      });
  
      if (!result || result.avg_humidity === null) {
        return res.status(404).json({ error: 'No humidity data found for June 2021.' });
      }
  
      return res.status(200).json({
        message: 'Average humidity for June 2021',
        avg_humidity: parseFloat(result.avg_humidity)
      });
  
    } catch (error) {
      console.error('getAverageHumidityJune2021 error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  /** Average Summer Humidity where Temperature > 30°C - April 16, 2020 to November 5, 2020 */
  export const getAverageSummerHumidityAbove30 = async (req, res) => {
    try {
      const result = await HiveObservation.findOne({
        attributes: [
          [Sequelize.fn('AVG', Sequelize.col('humidity')), 'avg_humidity']
        ],
        where: {
          published_at: {
            [Op.between]: ['2020-04-16T00:00:00Z', '2020-11-05T23:59:59Z']
          },
          temperature: {
            [Op.gt]: 30
          }
        },
        raw: true
      });
  
      if (!result || result.avg_humidity === null) {
        return res.status(404).json({ error: 'No humidity data found where temperature > 30°C.' });
      }
  
      return res.status(200).json({
        message: 'Average summer humidity where temperature > 30°C',
        avg_humidity: parseFloat(result.avg_humidity)
      });
  
    } catch (error) {
      console.error('getAverageSummerHumidityAbove30 error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

/** Maximum Humidity during Full Year Period */
  export const getMaxHumidityFullYear = async (req, res) => {
    try {
      const result = await HiveObservation.findOne({
        attributes: [
          [Sequelize.fn('MAX', Sequelize.col('humidity')), 'max_humidity']
        ],
        where: {
          published_at: {
            [Op.between]: ['2020-04-16T00:00:00Z', '2021-04-14T23:59:59Z']
          }
        },
        raw: true
      });
  
      if (!result || result.max_humidity === null) {
        return res.status(404).json({ error: 'No humidity data found for the period.' });
      }
  
      return res.status(200).json({
        message: 'Maximum humidity between April 16, 2020 and April 14, 2021',
        max_humidity: parseFloat(result.max_humidity)
      });
  
    } catch (error) {
      console.error('getMaxHumidityFullYear error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  /** Maximum Humidity during Full Year Period */
  export const getMinHumidityFullYear = async (req, res) => {
    try {
      const result = await HiveObservation.findOne({
        attributes: [
          [Sequelize.fn('MIN', Sequelize.col('humidity')), 'min_humidity']
        ],
        where: {
          published_at: {
            [Op.between]: ['2020-04-16T00:00:00Z', '2021-04-14T23:59:59Z']
          }
        },
        raw: true
      });
  
      if (!result || result.min_humidity === null) {
        return res.status(404).json({ error: 'No humidity data found for the period.' });
      }
  
      return res.status(200).json({
        message: 'Minimum humidity between April 16, 2020 and April 14, 2021',
        min_humidity: parseFloat(result.min_humidity)
      });
  
    } catch (error) {
      console.error('getMinHumidityFullYear error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };