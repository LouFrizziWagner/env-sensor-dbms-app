import HiveObservation from "../../models/mongodb/HiveObservation.js";


/** TEMP QUERIES */
// Mongoose version of Summer Monthly Avg Temperature
export const getAverageMonthlyTemperatureSummer2020 = async (req, res) => {
  try {
    const results = await HiveObservation.aggregate([
      {
        $match: {
          published_at: {
            $gte: new Date('2020-04-16T00:00:00Z'),
            $lte: new Date('2020-11-05T23:59:59Z')
          }
        }
      },
      {
        $group: {
          _id: {
            hive_sensor_id: "$hive_sensor_id",
            month: { $dateToString: { format: "%Y-%m", date: "$published_at" } }
          },
          avg_temp: { $avg: "$temperature" }
        }
      },
      {
        $project: {
          _id: 0,
          hive_sensor_id: "$_id.hive_sensor_id",
          month: "$_id.month",
          avg_temp: 1
        }
      },
      {
        $sort: {
          hive_sensor_id: 1,
          month: 1
        }
      }
    ]);

    return res.status(200).json({ message: 'Summer monthly average temperature', data: results });
  } catch (error) {
    console.error('getAverageMonthlyTemperatureSummer error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
