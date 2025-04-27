import { Router } from 'express';
import {
  writeSingleObservation
  } from '../controllers/mysql/hive-observation.controller.js';
import {
  getAllBeehubNames,
  getAllHiveSensors,
  bulkRead1000HiveObservations,
  bulkRead500000HiveObservations,
  insertSingleHiveObservation,
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

router.post('/mysql/write-single-observation', writeSingleObservation);


/** General Queries */
router.get('/beehub-names', getAllBeehubNames);
router.get('/hive-sensors', getAllHiveSensors);
router.get('/time-between-observations/14-days', getTimeDifferencesBetweenObservations);

router.get('/bulk-read-10000', bulkRead1000HiveObservations);
router.get('/bulk-read-500000', bulkRead500000HiveObservations);
router.post('/single-insert', insertSingleHiveObservation);


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



export default router;
