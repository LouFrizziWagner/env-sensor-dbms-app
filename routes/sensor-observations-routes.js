import { Router } from 'express';
//Sql controllers
import {
    getMysqlTestHiveObservations,
    createMySQLSensorData,
    bulkCreateMySQLSensorData,
    getMySQLSensorData,
    getMySQLSensorDataById,
    updateMySQLSensorData,
    deleteMySQLSensorData,
    // benchmarkMySQLInsert,
    // benchmarkMySQLRead,
    // getMySQLTimeRange,
    // getMySQLAvgTemperature
  } from '../controllers/mysql/hive-observation.controller.js';
  

//NoSql controllers
// import {
//     createMongoSensorData,
//     bulkMongoSensorData,
//     getMongoSensorData,
//     getMongoSensorDataById,
//     updateMongoSensorData,
//     DeleteMongoSensorData,
//     benchmarkMongoInsert,
//     benchmarkMongoRead,
//     getMongoTimeRange,
//     getMongoAvgTemperature
//   } from '../controllersNosql/mongoSensorDataController.js';

const router = Router();

/*Endpoints can be same but since our servers will run in different ports we will avoid collision , namely mongo server 3000 and mysql server 4000 */

//Mongo Routes

// router.post('/mongo', createMongoSensorData);
// router.post('/mongo/bulk', bulkMongoSensorData);
// router.get('/mongo', getMongoSensorData);
// router.get('/mongo/:id', getMongoSensorDataById);
// router.put('/mongo/:id', updateMongoSensorData);
// router.delete('/mongo/:id', DeleteMongoSensorData);

// // Benchmark routes for Mongo
// router.get('/benchmark/mongo/insert', benchmarkMongoInsert);
// router.get('/benchmark/mongo/read', benchmarkMongoRead);


// //Extra Optional 
// router.get('/mongo/time-range/:hours', getMongoTimeRange);
// router.get('/mongo/aggregation/avg-temp', getMongoAvgTemperature)



//MySql Routes
router.get('/mysql/testview', getMysqlTestHiveObservations);
router.post('/mysql', createMySQLSensorData);
router.post('/mysql/bulk', bulkCreateMySQLSensorData);
router.get('/mysql', getMySQLSensorData);
router.get('/mysql/:id', getMySQLSensorDataById);
router.put('/mysql/:id', updateMySQLSensorData);
router.delete('/mysql/:id', deleteMySQLSensorData);

// // Benchmark routes for MySQL
// router.get('/benchmark/mysql/insert', benchmarkMySQLInsert);
// router.get('/benchmark/mysql/read', benchmarkMySQLRead);


// // Extra Optional 
// router.get('/mysql/time-range/:hours', getMySQLTimeRange);
// router.get('/mysql/aggregation/avg-temp', getMySQLAvgTemperature);


export default router;
