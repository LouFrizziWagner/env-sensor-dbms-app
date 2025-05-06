import HiveObservation from "../../models/mongodb/HiveObservation.js";

/** Average Daily Humidity PerHive */

/** Average Humidity for June 2021, returns one value */
export const getAverageHumidityJune2021 = async (req, res) => {
  try {
    const result = await HiveObservation.aggregate([
      {
        $match: {
          published_at: {
            $gte: new Date('2021-06-01T00:00:00Z'),
            $lte: new Date('2021-06-30T23:59:59Z')
          }
        }
      },
      {
        $group: {
          _id: null,
          avg_humidity: { $avg: "$humidity" }
        }
      }
    ]);

    if (!result.length || result[0].avg_humidity === null) {
      return res.status(404).json({ error: 'No humidity data found for June 2021.' });
    }

    return res.status(200).json({
      message: 'Average humidity for June 2021',
      avg_humidity: parseFloat(result[0].avg_humidity.toFixed(2))
    });

  } catch (error) {
    console.error('getAverageHumidityJune2021 error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/** Average Summer Humidity where Temperature > 30°C - April 16, 2020 to November 5, 2020 */

/** Maximum Humidity during Full Year Period */
export const getMaxHumidityFullYear = async (req, res) => {
  try {
    const result = await HiveObservation.aggregate([
      {
        $match: {
          published_at: {
            $gte: new Date('2020-04-16T00:00:00Z'),
            $lte: new Date('2021-04-14T23:59:59Z')
          }
        }
      },
      {
        $group: {
          _id: null,
          max_humidity: { $max: "$humidity" }
        }
      }
    ]);

    if (!result.length || result[0].max_humidity === null) {
      return res.status(404).json({ error: 'No humidity data found for the period.' });
    }

    return res.status(200).json({
      message: 'Maximum humidity between April 16, 2020 and April 14, 2021',
      max_humidity: parseFloat(result[0].max_humidity.toFixed(2))
    });

  } catch (error) {
    console.error('getMaxHumidityFullYear error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/** Min Humidity during Full Year Period */
