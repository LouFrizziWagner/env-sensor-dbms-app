import HiveObservation from "../../models/mysql/HiveObservation.js";
import { Op, QueryTypes } from "sequelize"; 
import Sequelize from "../../config/mysql-config.js";

// NEW ROUTES

// Controller: Create a single new observation
export const writeSingleObservation = async (req, res) => {
  try {
      // Insert a single record into MySQL
      const newData = await HiveObservation.create(req.body);

      return res.status(201).json({ 
          message: 'MySQL: Single observation created', 
          data: newData 
      });
  } catch (error) {
      console.error('writeSingleObservation error:', error);
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

//Create a single record 
export const createMySQLSensorData = async (req, res) => {
    try{
        const newData = await HiveObservation.create(req.body);
        return res.status(201).json({ message: 'MySQL: Data created', data: newData });
    } catch (error) {
        console.error('createMySQLSensorData error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
};

// 2. Bulk create multiple records
export const bulkCreateMySQLSensorData = async (req, res) => {
    try {
      // req.body should be an array of objects
      const newRecords = await HiveObservation.bulkCreate(req.body);
      return res.status(201).json({ message: 'MySQL: Bulk data created', data: newRecords });
    } catch (error) {
      console.error('bulkCreateMySQLSensorData error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // 3. Get all records
  export const getMySQLSensorData = async (req, res) => {
    try {
      const data = await HiveObservation.findAll();
      return res.status(200).json({ message: 'MySQL: All data', data });
    } catch (error) {
      console.error('getMySQLSensorData error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // 4. Get one record by ID
  export const getMySQLSensorDataById = async (req, res) => {
    try {
      const { id } = req.params;
      const record = await HiveObservation.findByPk(id);
      if (!record) {
        return res.status(404).json({ error: 'MySQL: Record not found' });
      }
      return res.status(200).json({ message: 'MySQL: Single record fetched', data: record });
    } catch (error) {
      console.error('getMySQLSensorDataById error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // 5. Update a record by ID
  export const updateMySQLSensorData = async (req, res) => {
    try {
      const { id } = req.params;
      const [rowsAffected] = await HiveObservation.update(req.body, { where: { id } });
      if (!rowsAffected) {
        return res.status(404).json({ error: 'MySQL: Record not found' });
      }
      // Optionally fetch updated record
      const updated = await HiveObservation.findByPk(id);
      return res.status(200).json({ message: 'MySQL: Data updated', data: updated });
    } catch (error) {
      console.error('updateMySQLSensorData error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  // 6. Delete a record by ID
  export const deleteMySQLSensorData = async (req, res) => {
    try {
      const { id } = req.params;
      const rowsDeleted = await HiveObservation.destroy({ where: { id } });
      if (!rowsDeleted) {
        return res.status(404).json({ error: 'MySQL: Record not found' });
      }
      return res.status(200).json({ message: 'MySQL: Data deleted' });
    } catch (error) {
      console.error('deleteMySQLSensorData error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  