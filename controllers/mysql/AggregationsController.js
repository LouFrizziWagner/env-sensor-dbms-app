import HiveObservation from "../../models/mysql/HiveObservation.js";
import { Op, QueryTypes } from "sequelize"; 
import Sequelize from "../../config/mysql-config.js";

/**
 * Get hourly average hive power trend for a static date (2021-06-15).
 */
export const getHourlyHivePowerTrendStatic = async (req, res) => {
    try {
      const date = '2021-06-15';
  
      const results = await HiveObservation.findAll({
        attributes: [
          [Sequelize.fn('HOUR', Sequelize.col('published_at')), 'hour'],
          [Sequelize.fn('AVG', Sequelize.col('hive_power')), 'avg_hive_power']
        ],
        where: {
          published_at: {
            [Op.between]: [`${date}T00:00:00Z`, `${date}T23:59:59Z`]
          }
        },
        group: [Sequelize.fn('HOUR', Sequelize.col('published_at'))],
        order: [[Sequelize.fn('HOUR', Sequelize.col('published_at')), 'ASC']],
        raw: true
      });
  
      return res.status(200).json({ message: `Static: Hourly hive power trend for ${date}`, data: results });
    } catch (error) {
      console.error('getHourlyHivePowerTrendStatic error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

/**
 * Get Top 5 hives by highest average humidity during static week (2021-06-01 to 2021-06-07).
 */
  export const getTop5HivesByWeeklyHumidityStatic = async (req, res) => {
    try {
      const start = '2021-06-01';
      const end = '2021-06-07';
  
      const results = await HiveObservation.findAll({
        attributes: [
          'hive_sensor_id',
          [Sequelize.fn('AVG', Sequelize.col('humidity')), 'avg_humidity']
        ],
        where: {
          published_at: {
            [Op.between]: [`${start}T00:00:00Z`, `${end}T23:59:59Z`]
          }
        },
        group: ['hive_sensor_id'],
        order: [[Sequelize.literal('avg_humidity'), 'DESC']],
        limit: 5,
        raw: true
      });
  
      return res.status(200).json({ message: `Static: Top 5 hives by humidity from ${start} to ${end}`, data: results });
    } catch (error) {
      console.error('getTop5HivesByWeeklyHumidityStatic error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

/** Get temperature variance per hive between static dates (2020-04-16 to 2021-04-14). */
  export const getTemperatureVariancePerHiveStatic = async (req, res) => {
    try {
      const start = '2020-04-16';
      const end = '2021-04-14';
  
      const results = await HiveObservation.findAll({
        attributes: [
          'hive_sensor_id',
          [Sequelize.fn('VAR_POP', Sequelize.col('temperature')), 'temperature_variance']
        ],
        where: {
          published_at: {
            [Op.between]: [`${start}T00:00:00Z`, `${end}T23:59:59Z`]
          }
        },
        group: ['hive_sensor_id'],
        order: [['hive_sensor_id', 'ASC']],
        raw: true
      });
  
      return res.status(200).json({ message: `Static: Temperature variance per hive from ${start} to ${end}`, data: results });
    } catch (error) {
      console.error('getTemperatureVariancePerHiveStatic error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  /** Humidity Daily Range (Static: 2020-04-16 to 2021-04-14) */
  export const getHumidityDailyRangeStatic = async (req, res) => {
    try {
      const start = '2020-04-16';
      const end = '2021-04-14';
  
      const results = await HiveObservation.findAll({
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('published_at')), 'day'],
          [Sequelize.fn('MAX', Sequelize.col('humidity')), 'max_humidity'],
          [Sequelize.fn('MIN', Sequelize.col('humidity')), 'min_humidity'],
          [Sequelize.literal('MAX(humidity) - MIN(humidity)'), 'humidity_range']
        ],
        where: {
          published_at: {
            [Op.between]: [`${start}T00:00:00Z`, `${end}T23:59:59Z`]
          }
        },
        group: [Sequelize.fn('DATE', Sequelize.col('published_at'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('published_at')), 'ASC']],
        raw: true
      });
  
      return res.status(200).json({ message: `Static: Humidity daily range from ${start} to ${end}`, data: results });
    } catch (error) {
      console.error('getHumidityDailyRangeStatic error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  /** Daily Hive Power Anomaly Detection (Std Dev) (Static: 2020-04-16 to 2021-04-14) */
  export const getDailyHivePowerAnomalyStatic = async (req, res) => {
    try {
      const start = '2020-04-16';
      const end = '2021-04-14';
  
      const results = await HiveObservation.findAll({
        attributes: [
          'hive_sensor_id',
          [Sequelize.fn('DATE', Sequelize.col('published_at')), 'day'],
          [Sequelize.fn('STDDEV_POP', Sequelize.col('hive_power')), 'hive_power_stddev']
        ],
        where: {
          published_at: {
            [Op.between]: [`${start}T00:00:00Z`, `${end}T23:59:59Z`]
          }
        },
        group: ['hive_sensor_id', Sequelize.fn('DATE', Sequelize.col('published_at'))],
        order: [
          ['hive_sensor_id', 'ASC'],
          [Sequelize.fn('DATE', Sequelize.col('published_at')), 'ASC']
        ],
        raw: true
      });
  
      return res.status(200).json({ message: `Static: Daily hive power anomaly detection from ${start} to ${end}`, data: results });
    } catch (error) {
      console.error('getDailyHivePowerAnomalyStatic error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

/** Correlation coefficient between temperature and humidity */
  export const getTemperatureHumidityCorrelation = async (req, res) => {
    try {
      // Get necessary values
      const results = await HiveObservation.findOne({
        attributes: [
          [Sequelize.fn('AVG', Sequelize.col('temperature')), 'avg_temp'],
          [Sequelize.fn('AVG', Sequelize.col('humidity')), 'avg_hum'],
          [Sequelize.fn('AVG', Sequelize.literal('temperature * humidity')), 'avg_temp_hum'],
          [Sequelize.fn('VAR_POP', Sequelize.col('temperature')), 'var_temp'],
          [Sequelize.fn('VAR_POP', Sequelize.col('humidity')), 'var_hum']
        ],
        raw: true
      });
  
      const avg_temp = parseFloat(results.avg_temp ?? 0);
      const avg_hum = parseFloat(results.avg_hum ?? 0);
      const avg_temp_hum = parseFloat(results.avg_temp_hum ?? 0);
      const var_temp = parseFloat(results.var_temp ?? 0);
      const var_hum = parseFloat(results.var_hum ?? 0);
  
      if (var_temp === 0 || var_hum === 0) {
        return res.status(400).json({ error: 'Variance is zero, cannot compute correlation.' });
      }
  
      // Covariance
      const covariance = avg_temp_hum - (avg_temp * avg_hum);
  
      // Correlation
      const correlation = covariance / (Math.sqrt(var_temp) * Math.sqrt(var_hum));
  
      return res.status(200).json({
        message: 'Temperature vs Humidity Correlation',
        correlation_coefficient: correlation
      });
    } catch (error) {
      console.error('getTemperatureHumidityCorrelation error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  /** compareAudioPowerMorningEvening */
  export const compareAudioPowerMorningEvening = async (req, res) => {
    try {
      // Morning: 6 AM to 12 PM
      const morningResults = await HiveObservation.findOne({
        attributes: [[Sequelize.fn('AVG', Sequelize.col('audio_density')), 'morning_avg_audio_density']],
        where: Sequelize.where(Sequelize.fn('HOUR', Sequelize.col('published_at')), {
          [Op.between]: [6, 11] // 6:00 to 11:59
        }),
        raw: true
      });
  
      // Evening: 6 PM to 12 AM
      const eveningResults = await HiveObservation.findOne({
        attributes: [[Sequelize.fn('AVG', Sequelize.col('audio_density')), 'evening_avg_audio_density']],
        where: Sequelize.where(Sequelize.fn('HOUR', Sequelize.col('published_at')), {
          [Op.between]: [18, 23] // 18:00 to 23:59
        }),
        raw: true
      });
  
      return res.status(200).json({
        message: 'Average Audio Power Comparison: Morning vs Evening',
        morning_avg_audio_density: parseFloat(morningResults.morning_avg_audio_density ?? 0),
        evening_avg_audio_density: parseFloat(eveningResults.evening_avg_audio_density ?? 0)
      });
    } catch (error) {
      console.error('compareAudioPowerMorningEvening error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };


  /** Over whole data set (real plus synthetic data) */

/** Get hourly average hive power trend for the entire dataset.*/
export const getHourlyHivePowerTrendAllTime = async (req, res) => {
    try {
      const results = await HiveObservation.findAll({
        attributes: [
          [Sequelize.fn('HOUR', Sequelize.col('published_at')), 'hour'],
          [Sequelize.fn('AVG', Sequelize.col('hive_power')), 'avg_hive_power']
        ],
        group: [Sequelize.fn('HOUR', Sequelize.col('published_at'))],
        order: [[Sequelize.fn('HOUR', Sequelize.col('published_at')), 'ASC']],
        raw: true
      });
  
      return res.status(200).json({ message: 'Hourly hive power trend over all time', data: results });
    } catch (error) {
      console.error('getHourlyHivePowerTrendAllTime error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

/** Get temperature variance per hive over entire dataset.*/
export const getTemperatureVariancePerHiveAllTime = async (req, res) => {
    try {
      const results = await HiveObservation.findAll({
        attributes: [
          'hive_sensor_id',
          [Sequelize.fn('VAR_POP', Sequelize.col('temperature')), 'temperature_variance']
        ],
        group: ['hive_sensor_id'],
        order: [['hive_sensor_id', 'ASC']],
        raw: true
      });
  
      return res.status(200).json({ message: 'Temperature variance per hive over all time', data: results });
    } catch (error) {
      console.error('getTemperatureVariancePerHiveAllTime error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

/**Get daily humidity range (max - min) for each day over entire dataset.*/
export const getHumidityDailyRangeAllTime = async (req, res) => {
    try {
      const results = await HiveObservation.findAll({
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('published_at')), 'day'],
          [Sequelize.fn('MAX', Sequelize.col('humidity')), 'max_humidity'],
          [Sequelize.fn('MIN', Sequelize.col('humidity')), 'min_humidity'],
          [Sequelize.literal('MAX(humidity) - MIN(humidity)'), 'humidity_range']
        ],
        group: [Sequelize.fn('DATE', Sequelize.col('published_at'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('published_at')), 'ASC']],
        raw: true
      });
  
      return res.status(200).json({ message: 'Daily humidity range over all time', data: results });
    } catch (error) {
      console.error('getHumidityDailyRangeAllTime error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  /** temperature trend for the hive sensor 200602 */
  export const getTemperatureTrendHive200602 = async (req, res) => {
    try {
      const hiveId = 200602; 
  
      const results = await HiveObservation.findAll({
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('published_at')), 'day'],
          [Sequelize.fn('AVG', Sequelize.col('temperature')), 'avg_temp']
        ],
        where: {
          hive_sensor_id: hiveId
        },
        group: [Sequelize.fn('DATE', Sequelize.col('published_at'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('published_at')), 'ASC']],
        raw: true
      });
  
      return res.status(200).json({ 
        message: `Average daily temperature trend for static Hive ID ${hiveId}`,
        data: results
      });
    } catch (error) {
      console.error('getTemperatureTrendHive1 error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };