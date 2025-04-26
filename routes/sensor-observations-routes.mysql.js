import { Router } from 'express';
import {
  writeSingleObservation,
  getAverageDailyTemperature,
  getAverageDailyTemperatureSummer,
  getOverallAverageTemperatureJune2021
  } from '../controllers/mysql/hive-observation.controller.js';
  
const router = Router();

router.post('/mysql/write-single-observation', writeSingleObservation);
router.get('/average-daily-temperature', getAverageDailyTemperature);
router.get('/average-daily-summer-temperature', getAverageDailyTemperatureSummer);
router.get('/average-daily-temperature/june-2021', getOverallAverageTemperatureJune2021);

export default router;
