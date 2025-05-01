import { Router } from 'express';
import {
  insertSingleObservation,
  bulkInsertAfterOffline,
  simulateSensorInsertion,
  bulkInsertObservations,
  bulkInsertObservationsAtomicity
} from '../controllers/mysql/InsertObservationsController.js'
import {
  deleteMostRecentObservation,
  getMysqlTestHiveObservations,
  getLastFiveObservations,
  getFirstFiveObservations,
  getAllBeehubNames,
  getDistinctHiveSensors,
  bulkReadOneThousandHiveObservations,
  bulkReadTenThousandHiveObservations,
  bulkReadOneHundredThousandHiveObservations,
  getTimeDifferencesBetweenObservations
} from '../controllers/mysql/HiveAnalysisController.js'
import {
    getAverageMonthlyTemperatureWinter2020,
    getTotalAverageTemperatureJune2021,
    getAverageDailyTemperatureFullYear,
    getAverageMonthlyTemperatureSummer2020,
    getTotalAverageTemperatureDynamic
    } from '../controllers/mysql/TemperatureAnalysisController.js';
import {
  getAverageDailyHumidityPerHive,
  getAverageHumidityJune2021,
  getAverageSummerHumidityAbove30,
  getMaxHumidityFullYear,
  getMinHumidityFullYear
} from '../controllers/mysql/HumdityAnalysisController.js';
import {
  getHourlyHivePowerTrendStatic,
  getTop5HivesByWeeklyHumidityStatic,
  getTemperatureVariancePerHiveStatic,
  getHumidityDailyRangeStatic,
  getDailyHivePowerAnomalyStatic,
  getTemperatureHumidityCorrelation,
  compareAudioPowerMorningEvening,
  getHourlyHivePowerTrendAllTime,
  getTemperatureVariancePerHiveAllTime,
  getHumidityDailyRangeAllTime,
  getTemperatureTrendHive200602
} from '../controllers/mysql/AggregationsController.js';

const router = Router();

/** Inserts */
router.post('/single-observation-insert', insertSingleObservation);
router.post('/mysql/bulk-insert-after-offline', bulkInsertAfterOffline);
// router.post('/mysql/large-bulk-batch-insert', bulkInsertAfterOffline);

// router.post('/mysql/benchmark-insert-2', insertTwoBatches);
// router.post('/mysql/benchmark-insert-10', insertTenBatches);
// router.post('/mysql/benchmark-insert-realistic', insertRealisticSensorDB);

// router.post('/mysql/bulk-insert', bulkInsertObservations);
// router.post('/mysql/bulk-insert-atomicity', bulkInsertObservations);
// router.post('/simulate-sensor-insert', async (req, res) => {
//   const { observations, batchSize = 100, delayMs = 1000 } = req.body;

//   if (!observations || !Array.isArray(observations) || observations.length === 0) {
//     return res.status(400).json({ message: 'Invalid or missing observations array.' });
//   }

//   try {
//     await simulateSensorInsertion(observations, batchSize, delayMs);
//     res.status(200).json({ message: 'Simulation completed successfully.' });
//   } catch (error) {
//     console.error('Simulation error:', error);
//     res.status(500).json({ message: 'Simulation failed.', error: error.message });
//   }
// });

/** General Queries */
router.get('/get-last-observations', getLastFiveObservations);
router.get('/get-first-observations', getFirstFiveObservations);
router.get('/beehub-names', getAllBeehubNames);
router.get('/hive-sensors', getDistinctHiveSensors);
router.get('/time-between-observations/14-days', getTimeDifferencesBetweenObservations);

// before run in mysql: RESET QUERY CACHE;
router.get('/bulk-read-1000', bulkReadOneThousandHiveObservations);
router.get('/bulk-read-10000', bulkReadTenThousandHiveObservations);
router.get('/bulk-read-100000', bulkReadOneHundredThousandHiveObservations);
//router.post('/single-insert', insertSingleHiveObservation);


/** Temperature Analysis */
router.get('/average-monthly-temperature/summer-2020', getAverageMonthlyTemperatureSummer2020);
router.get('/average-monthly-temperature/winter-2020', getAverageMonthlyTemperatureWinter2020);
router.get('/total-average-temperature/june-2021', getTotalAverageTemperatureJune2021);
router.get('/average-daily-temperature/year-2020-2021', getAverageDailyTemperatureFullYear);
// /mysql/total-average-temperature?start=2021-06-01&end=2021-06-30
router.get('/total-average-temperature', getTotalAverageTemperatureDynamic);

/** Humidity Analysis */
router.get('/average-daily-humidity-per-hive', getAverageDailyHumidityPerHive);
router.get('/average-humidity/june-2021', getAverageHumidityJune2021);
router.get('/average-humidity/temp-over-30/summer-2021', getAverageSummerHumidityAbove30);
router.get('/max-humidity/year-2020-2021', getMaxHumidityFullYear);
router.get('/min-humidity/year-2020-2021', getMinHumidityFullYear);

/** Higher Complexity Analysis */
router.get('/hourly-hive-power-trend', getHourlyHivePowerTrendStatic);
router.get('/top5-weekly-average-humidity', getTop5HivesByWeeklyHumidityStatic);
router.get('/temperature-variance-per-hive', getTemperatureVariancePerHiveStatic);
router.get('/humidity-daily-range', getHumidityDailyRangeStatic);
router.get('/daily-hive-power-anomaly', getDailyHivePowerAnomalyStatic);
router.get('/temperature-humidity-correlation', getTemperatureHumidityCorrelation);
router.get('/compare-audio-morning-evening', compareAudioPowerMorningEvening);
// over three year data:
router.get('/hourly-hive-power-trend/2020-2023', getHourlyHivePowerTrendAllTime);
router.get('/temperature-variance-per-hive/2020-2023', getTemperatureVariancePerHiveAllTime);
router.get('/humidity-daily-range/2020-2023', getHumidityDailyRangeAllTime);
router.get('/temperature-trend/hive-200602/2020-2023', getTemperatureTrendHive200602);

// Testing
router.get('/top-twenty-observations', getMysqlTestHiveObservations);
router.delete('/delete-recent-observation', deleteMostRecentObservation);


export default router;
