import HiveObservation from "../../models/mongodb/HiveObservation.js";

/**
 * Get hourly average hive power trend for a static date (2021-06-15).
 */

export const getHourlyHivePowerTrendStatic = async (req, res) => {
    try {
      const date = '2021-06-15';
  
      const start = new Date(`${date}T00:00:00Z`);
      const end = new Date(`${date}T23:59:59Z`);
  
      const results = await HiveObservation.aggregate([
        {
          $match: {
            published_at: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: { hour: { $hour: "$published_at" } },
            avg_hive_power: { $avg: "$hive_power" }
          }
        },
        {
          $project: {
            _id: 0,
            hour: "$_id.hour",
            avg_hive_power: 1
          }
        },
        {
          $sort: { hour: 1 }
        }
      ]);
  
      return res.status(200).json({ message: `Static: Hourly hive power trend for ${date}`, data: results });
    } catch (error) {
      console.error('getHourlyHivePowerTrendStatic error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
};

// Optimized getHourlyHivePowerTrendStatic
export const getHourlyHivePowerTrendStaticOptimized = async (req, res) => {
    try {
      const date = '2021-06-15';
      const start = new Date(`${date}T00:00:00Z`);
      const end = new Date(`${date}T23:59:59Z`);
  
      const results = await HiveObservation.aggregate([
        {
          $match: {
            published_at: {
              $gte: start,
              $lt: new Date(start.getTime() + 24 * 60 * 60 * 1000) // avoid using $lte end if millis are uneven
            },
            hive_power: { $ne: null } // 🧠 filter out nulls early
          }
        },
        {
          $project: {
            hour: { $hour: "$published_at" },
            hive_power: 1
          }
        },
        {
          $group: {
            _id: "$hour",
            avg_hive_power: { $avg: "$hive_power" }
          }
        },
        {
          $project: {
            hour: "$_id",
            avg_hive_power: { $round: ["$avg_hive_power", 2] },
            _id: 0
          }
        },
        {
          $sort: { hour: 1 }
        }
      ]);
  
      return res.status(200).json({
        message: `Static: Hourly hive power trend for ${date}`,
        data: results
      });
    } catch (error) {
      console.error('getHourlyHivePowerTrendStatic error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
};

/** Get temperature variance per hive between static dates (2020-04-16 to 2021-04-14). */
export const getTemperatureVariancePerHiveStatic = async (req, res) => {
  try {
    const start = new Date('2020-04-16T00:00:00Z');
    const end = new Date('2021-04-14T23:59:59Z');

    const results = await HiveObservation.aggregate([
      {
        $match: {
          published_at: { $gte: start, $lte: end },
          temperature: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$hive_sensor_id",
          temperature_variance: { $stdDevPop: "$temperature" } // standard deviation, squared = variance
        }
      },
      {
        $project: {
          hive_sensor_id: "$_id",
          _id: 0,
          temperature_variance: {
            $round: [
              { $multiply: ["$temperature_variance", "$temperature_variance"] },
              4
            ]
          }
        }
      },
      {
        $sort: { hive_sensor_id: 1 }
      }
    ]);

    return res.status(200).json({
      message: `Static: Temperature variance per hive from 2020-04-16 to 2021-04-14`,
      data: results
    });
  } catch (error) {
    console.error('getTemperatureVariancePerHiveStatic error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/** Humidity Daily Range (Static: 2020-04-16 to 2021-04-14) */

/** Daily Hive Power Anomaly Detection (Std Dev) (Static: 2020-04-16 to 2021-04-14) */

/** Correlation coefficient between temperature and humidity */

/** compareAudioPowerMorningEvening */

/** Over whole data set (real plus synthetic data) */

/** Get hourly average hive power trend for the entire dataset.*/
export const getHourlyHivePowerTrendAllTime = async (req, res) => {
  try {
    const results = await HiveObservation.aggregate([
      {
        $match: {
          hive_power: { $ne: null }
        }
      },
      {
        $project: {
          hour: { $hour: "$published_at" },
          hive_power: 1
        }
      },
      {
        $group: {
          _id: "$hour",
          avg_hive_power: { $avg: "$hive_power" }
        }
      },
      {
        $project: {
          _id: 0,
          hour: "$_id",
          avg_hive_power: { $round: ["$avg_hive_power", 2] }
        }
      },
      {
        $sort: { hour: 1 }
      }
    ]);

    return res.status(200).json({ message: 'Hourly hive power trend over all time', data: results });
  } catch (error) {
    console.error('getHourlyHivePowerTrendAllTime error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/** Get temperature variance per hive over entire dataset.*/

/** Get daily humidity range (max - min) for each day over entire dataset.*/
export const getHumidityDailyRangeAllTime = async (req, res) => {
  try {
    const results = await HiveObservation.aggregate([
      {
        $match: {
          humidity: { $ne: null }
        }
      },
      {
        $project: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$published_at" } },
          humidity: 1
        }
      },
      {
        $group: {
          _id: "$date",
          max_humidity: { $max: "$humidity" },
          min_humidity: { $min: "$humidity" }
        }
      },
      {
        $project: {
          day: "$_id",
          _id: 0,
          max_humidity: 1,
          min_humidity: 1,
          humidity_range: {
            $round: [{ $subtract: ["$max_humidity", "$min_humidity"] }, 2]
          }
        }
      },
      {
        $sort: { day: 1 }
      }
    ]);

    return res.status(200).json({ message: 'Daily humidity range over all time', data: results });
  } catch (error) {
    console.error('getHumidityDailyRangeAllTime error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


/** temperature trend for the hive sensor 200602 */
