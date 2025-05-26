import { Router } from 'express';
import {
    insertSingleObservation,
    simulateBulkInsertAfterOfflineFor60Minutes,
    bulkInsertAfterOffline
} from '../controllers/mongodb/InsertObservationsController.js'
import {
    getDistinctHiveSensors,
    bulkReadOneThousandHiveObservations,
    bulkReadFiveThousandHiveObservations,
    bulkReadTenThousandHiveObservations,
    bulkReadTwentyThousandHiveObservations,
    bulkReadOneHundredThousandHiveObservations,
    getMongodbTestHiveObservations,
    getLastFiveObservations,
    getFirstFiveObservations,
    getTimeDifferencesBetweenObservations
} from '../controllers/mongodb/HiveAnalysisController.js';
import { 
    getAverageMonthlyTemperatureSummer2020,

} from '../controllers/mongodb/TemperatureAnalysisController.js';
import { 
    getAverageHumidityJune2021,
    getMaxHumidityFullYear
} from '../controllers/mongodb/HumdityAnalysisController.js';
import { 
    getHourlyHivePowerTrendStatic,
    getHourlyHivePowerTrendStaticOptimized,
    getTemperatureVariancePerHiveStatic,
    getHourlyHivePowerTrendAllTime,
    getHumidityDailyRangeAllTime,
    getTemperatureHumidityCorrelation
} from '../controllers/mongodb/AggregationsController.js';


const router = Router();

/** Inserts */
router.post('/single-observation-insert', insertSingleObservation);
router.post('/bulk-insert-after-offline/60-min', simulateBulkInsertAfterOfflineFor60Minutes);
router.post('/bulk-insert-after-offline/dynamic', bulkInsertAfterOffline);


/** General Queries */
router.get('/hive-sensors', getDistinctHiveSensors);
router.get('/time-between-observations/14-days', getTimeDifferencesBetweenObservations);

/** Reads */
// before run: RESET CACHE;
router.get('/bulk-read-1000', bulkReadOneThousandHiveObservations);
router.get('/bulk-read-5000', bulkReadFiveThousandHiveObservations);
router.get('/bulk-read-10000', bulkReadTenThousandHiveObservations);
router.get('/bulk-read-20000', bulkReadTwentyThousandHiveObservations);
router.get('/bulk-read-100000', bulkReadOneHundredThousandHiveObservations);

/** Temperature Analysis */
router.get('/average-monthly-temperature/summer-2020', getAverageMonthlyTemperatureSummer2020);

/** Humidity Analysis */
router.get('/average-humidity/june-2021', getAverageHumidityJune2021);
router.get('/max-humidity/year-2020-2021', getMaxHumidityFullYear);

/** Higher Complexity Analysis */
router.get('/hourly-hive-power-trend', getHourlyHivePowerTrendStatic);
router.get('/hourly-hive-power-trend', getHourlyHivePowerTrendStaticOptimized); //mongodb duplicate with optimizatioin
router.get('/temperature-variance-per-hive', getTemperatureVariancePerHiveStatic);
router.get('/temperature-humidity-correlation', getTemperatureHumidityCorrelation);
// over three year data:
router.get('/hourly-hive-power-trend/2020-2023', getHourlyHivePowerTrendAllTime);
router.get('/humidity-daily-range/2020-2023', getHumidityDailyRangeAllTime);

/** Routes for testing */
router.get('/top-twenty-observations', getMongodbTestHiveObservations);
router.get('/get-first-observations', getLastFiveObservations);
router.get('/get-last-observations', getFirstFiveObservations);

export default router;
