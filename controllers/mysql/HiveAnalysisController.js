import HiveObservation from "../../models/mysql/HiveObservation.js";
import { Op, QueryTypes } from "sequelize"; 
import Sequelize from "../../config/mysql-config.js";


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
  
  export const getAllHiveSensors = async (req, res) => {
    try {
      const results = await HiveObservation.findAll({
        attributes: [
          [Sequelize.fn('DISTINCT', Sequelize.col('hive_sensor_id')), 'beehub_namehive_sensor_id']
        ],
        raw: true
      });
  
      return res.status(200).json({ hive_sensor_id: results.map(r => r.beehub_namehive_sensor_id) });
    } catch (error) {
      console.error('hive_sensor_id error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const bulkRead1000HiveObservations = async (req, res) => {
    try {
      const results = await HiveObservation.findAll({
        limit: 10000,
        order: [['published_at', 'DESC']], // latest first
        raw: true
      });
  
      return res.status(200).json({
        message: 'Bulk read of 10,000 hive observations',
        data: results
      });
    } catch (error) {
      console.error('bulkRead1000HiveObservations error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const bulkRead500000HiveObservations = async (req, res) => {
    try {
      const results = await HiveObservation.findAll({
        limit: 5000000,
        order: [['published_at', 'DESC']], // latest first
        raw: true
      });
  
      return res.status(200).json({
        message: 'Bulk read of 500,000 hive observations',
        data: results
      });
    } catch (error) {
      console.error('bulkRead500000HiveObservations error:', error);
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
        WHERE published_at BETWEEN '${start}' AND '${end}'
        ORDER BY hive_sensor_id, published_at;
      `, { type: QueryTypes.SELECT });
  
      return res.status(200).json({ message: 'Time differences between observations', data: results });
    } catch (error) {
      console.error('getTimeDifferencesBetweenObservations error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };