import HiveObservation from "../../models/mysql/HiveObservation.js";
import { Op, QueryTypes } from "sequelize"; 
import Sequelize from "../../config/mysql-config.js";


/** TEMP QUERIES */

// Static Average Temperature of  June 2021
export const getTotalAverageTemperatureJune2021 = async (req, res) => {
    try {
        const result = await HiveObservation.findOne({
            attributes: [
                [Sequelize.fn('AVG', Sequelize.col('temperature')), 'avg_temp']
            ],
            where: {
                published_at: {
                    [Op.between]: ['2021-06-01T00:00:00Z', '2021-06-30T23:59:59Z']
                }
            },
            raw: true
        });
  
        return res.status(200).json({ message: 'total average temperature for June 2021', avg_temp: parseFloat(result.avg_temp) });
    } catch (error) {
        console.error('getTotalAverageTemperatureJune2021 error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Static Full Year
  //Get the average temperature per hive, for each day, between April 16, 2020, and April 14, 2021

  export const getAverageDailyTemperatureFullYear = async (req, res) => {
    try {
        const results = await HiveObservation.findAll({
            attributes: [
                'hive_sensor_id',
                [Sequelize.fn('DATE', Sequelize.col('published_at')), 'day'],
                [Sequelize.fn('AVG', Sequelize.col('temperature')), 'avg_temp']
            ],
            where: {
                published_at: {
                    [Op.between]: ['2020-04-16T00:00:00Z', '2021-04-14T23:59:59Z']
                }
            },
            group: ['hive_sensor_id', Sequelize.fn('DATE', Sequelize.col('published_at'))],
            order: [
                ['hive_sensor_id', 'ASC'],
                [Sequelize.fn('DATE', Sequelize.col('published_at')), 'ASC']
            ]
        });
  
        return res.status(200).json({ message: 'Full year average temperature', data: results });
    } catch (error) {
        console.error('getAverageDailyTemperatureFullYear error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Static Summer
  export const getAverageMonthlyTemperatureSummer2020 = async (req, res) => {
    try {
      const results = await HiveObservation.findAll({
        attributes: [
          'hive_sensor_id',
          [Sequelize.fn('DATE_FORMAT', Sequelize.col('published_at'), "%Y-%m"), 'month'],
          [Sequelize.fn('AVG', Sequelize.col('temperature')), 'avg_temp']
        ],
        where: {
          published_at: {
            [Op.between]: ['2020-04-16T00:00:00Z', '2020-11-05T23:59:59Z']
          }
        },
        group: [
          'hive_sensor_id',
          Sequelize.fn('DATE_FORMAT', Sequelize.col('published_at'), "%Y-%m")
        ],
        order: [
          ['hive_sensor_id', 'ASC'],
          [Sequelize.fn('DATE_FORMAT', Sequelize.col('published_at'), "%Y-%m"), 'ASC']
        ]
      });
  
      return res.status(200).json({ message: 'Summer monthly average temperature', data: results });
    } catch (error) {
      console.error('getAverageMonthlyTemperatureSummer error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // Static Winter
  export const getAverageMonthlyTemperatureWinter2020 = async (req, res) => {
    try {
        const results = await HiveObservation.findAll({
            attributes: [
                'hive_sensor_id',
                [Sequelize.fn('DATE_FORMAT', Sequelize.col('published_at'), "%Y-%m"), 'month'],
                [Sequelize.fn('AVG', Sequelize.col('temperature')), 'avg_temp']
              ],
            where: {
                published_at: {
                    [Op.between]: ['2020-11-06T00:00:00Z', '2021-04-14T23:59:59Z']
                }
            },
            group: ['hive_sensor_id', 
                Sequelize.fn('DATE_FORMAT', Sequelize.col('published_at'), "%Y-%m")],
            order: [
                  ['hive_sensor_id', 'ASC'],
                  [Sequelize.fn('DATE_FORMAT', Sequelize.col('published_at'), "%Y-%m"), 'ASC']
                ]
        });
  
        return res.status(200).json({ message: 'Winter average temperature', data: results });
    } catch (error) {
        console.error('getAverageDailyTemperatureWinter error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
  };
 
  // Dynamic time range
  // uses only date and not full time stamp, static routes use full time stamp
  export const getTotalAverageTemperatureDynamic = async (req, res) => {
    const { start, end } = req.query;
  
    try {
      // Is time range valid
      if (!start || !end) {
        return res.status(400).json({ error: 'Start and end dates are required in query parameters.' });
      }
  
      const startDate = new Date(start);
      const endDate = new Date(end);
  
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
      }
  
      if (startDate >= endDate) {
        return res.status(400).json({ error: 'Start date must be before end date.' });
      }
  
      // Query mysql database via sequelize
      const result = await HiveObservation.findOne({
        attributes: [
          [Sequelize.fn('AVG', Sequelize.col('temperature')), 'avg_temp']
        ],
        where: {
          published_at: {
            [Op.between]: [startDate.toISOString(), endDate.toISOString()]
          }
        },
        raw: true
      });
  
      // if no data is found
      if (!result || result.avg_temp === null) {
        return res.status(404).json({ error: 'No temperature data found for the given range.' });
      }
  
      return res.status(200).json({
        message: `Average temperature between ${start} and ${end}`,
        avg_temp: parseFloat(result.avg_temp)
      });
  
    } catch (error) {
      console.error('getTotalAverageTemperatureDynamic error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  