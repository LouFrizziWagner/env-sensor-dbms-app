import { Router } from 'express';
import {
  insertSingleObservation,
  simulateBulkInsertAfterOfflineFor60Minutes,
  bulkInsertAfterOffline
} from '../controllers/mysql/InsertObservationsController.js'
import {
  deleteMostRecentObservation,
  getMysqlTestHiveObservations,
  getLastFiveObservations,
  getFirstFiveObservations,
  getAllBeehubNames,
  getDistinctHiveSensors,
  bulkReadOneThousandHiveObservations,
  bulkReadFiveThousandHiveObservations,
  bulkReadTwentyThousandHiveObservations,
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
router.post('/bulk-insert-after-offline/60-min', simulateBulkInsertAfterOfflineFor60Minutes);
router.post('/bulk-insert-after-offline/dynamic', bulkInsertAfterOffline);


/** General Queries */
router.get('/beehub-names', getAllBeehubNames);
router.get('/hive-sensors', getDistinctHiveSensors);
router.get('/time-between-observations/14-days', getTimeDifferencesBetweenObservations);

// before run in mysql: RESET QUERY CACHE;
router.get('/bulk-read-1000', bulkReadOneThousandHiveObservations);
router.get('/bulk-read-5000', bulkReadFiveThousandHiveObservations);
router.get('/bulk-read-10000', bulkReadTenThousandHiveObservations);
router.get('/bulk-read-20000', bulkReadTwentyThousandHiveObservations);
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

/** Routes for testing */
router.get('/top-twenty-observations', getMysqlTestHiveObservations);
router.get('/get-last-observations', getLastFiveObservations);
router.get('/get-first-observations', getFirstFiveObservations);
router.delete('/delete-recent-observation', deleteMostRecentObservation);


export default router;
