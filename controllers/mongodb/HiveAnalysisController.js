import HiveObservation from "../../models/mongodb/HiveObservation.js";

// Get distinct Hive Sensors
export const getDistinctHiveSensors = async (req, res) => {
  try {
    const hive_sensor_ids = await HiveObservation.distinct('hive_sensor_id');

    return res.status(200).json({
      hive_sensor_ids
    });
  } catch (error) {
    console.error('hive_sensor_id error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// bulk read 1000
export const bulkReadOneThousandHiveObservations = async (req, res) => {
  try {

    const results = await HiveObservation.find({})
      .sort({ published_at: -1 }) // DESC = latest first
      .limit(1000)
      .lean(); // Return raw JS objects (no Mongoose overhead)

    return res.status(200).json({
      message: 'Bulk read of 1000 hive observations',
      data: results
    });
  } catch (error) {
    console.error('bulkReadOneThousandHiveObservations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Bulk read 10 000
export const bulkReadTenThousandHiveObservations = async (req, res) => {
  try {

    const results = await HiveObservation.find({})
      .sort({ published_at: -1 }) // DESC = newest first
      .limit(10000)
      .lean(); // like Sequelize's raw: true

    return res.status(200).json({
      message: 'Bulk read of 10000 hive observations',
      data: results
    });
  } catch (error) {
    console.error('bulkReadTenThousandHiveObservations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// bulk read 100.000
export const bulkReadOneHundredThousandHiveObservations = async (req, res) => {
  try {

    const results = await HiveObservation.find({})
      .sort({ published_at: -1 }) // DESC = newest first
      .limit(100000)
      .lean(); // like Sequelize's raw: true

    return res.status(200).json({
      message: 'Bulk read of 100000 hive observations',
      data: results
    });
  } catch (error) {
    console.error('bulkReadOneHundredThousandHiveObservations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/** Time  */

/** Calculating time differences in minutes between consecutive observations grouped by hive_sensor_id. (Time Range D1 - D2 )*/
export const getTimeDifferencesBetweenObservations = async (req, res) => {
  try {
    const start = new Date('2020-04-16');
    const end = new Date('2020-04-30');

    const results = await HiveObservation.aggregate([
      {
        $match: {
          published_at: { $gte: start, $lte: end },
        },
      },
      {
        $sort: { hive_sensor_id: 1, published_at: 1 },
      },
      {
        $group: {
          _id: "$hive_sensor_id",
          observations: { $push: "$published_at" },
        },
      },
      {
        $project: {
          hive_sensor_id: "$_id",
          _id: 0,
          published_at: "$observations",
          minutes_between: {
            $map: {
              input: { $range: [1, { $size: "$observations" }] },
              as: "idx",
              in: {
                $divide: [
                  { $subtract: [
                    { $arrayElemAt: ["$observations", "$$idx"] },
                    { $arrayElemAt: ["$observations", { $subtract: ["$$idx", 1] }] }
                  ] },
                  60000
                ]
              }
            }
          }
        }
      },
      { $unwind: { path: "$minutes_between", includeArrayIndex: "index" } },
      {
        $project: {
          hive_sensor_id: 1,
          published_at: { $arrayElemAt: ["$published_at", { $add: ["$index", 1] }] },
          minutes_between: 1,
        }
      },
      { $sort: { hive_sensor_id: 1, published_at: 1 } }
    ]);

    return res.status(200).json({ message: 'Time differences between observations', data: results });
  } catch (error) {
    console.error('getTimeDifferencesBetweenObservations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// Test get for preview
export const getMongodbTestHiveObservations = async (req, res) => {
  try {

    const data = await HiveObservation.find({})
      .sort({ published_at: -1 }) // DESC
      .limit(20)
      .lean(); // returns plain JS objects (== raw: true in Sequelize)

    console.log('DB result sample:', data.slice(0, 1));

    return res.status(200).json({
      message: 'Fetched from DB',
      data
    });

  } catch (error) {
    console.error('getMongodbTestHiveObservations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLastFiveObservations = async (req, res) => {
  try {

    const results = await HiveObservation.find({})
      .sort({ published_at: -1 }) // DESCENDING
      .limit(5)
      .lean(); // Return plain JS objects (like Sequelize's raw: true)

    const transformedResults = results.map(entry => {
      const date = new Date(entry.published_at);
      const formattedDate = date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Berlin'
      });

      return {
        ...entry,
        published_at_formatted: formattedDate,
        geolocation_lat: entry.geolocation?.coordinates?.[1] ?? null,
        geolocation_long: entry.geolocation?.coordinates?.[0] ?? null
      };
    });

    return res.status(200).json({
      message: 'Get 5 latest hive observations',
      data: transformedResults
    });

  } catch (error) {
    console.error('getLastFiveObservations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFirstFiveObservations = async (req, res) => {
  try {

    const results = await HiveObservation.find({})
      .sort({ published_at: 1 }) // ASCENDING
      .limit(5)
      .lean(); // Like Sequelize's raw: true

    const transformedResults = results.map(entry => {
      const date = new Date(entry.published_at);
      const formattedDate = date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Berlin'
      });

      return {
        ...entry,
        published_at_formatted: formattedDate,
        geolocation_lat: entry.geolocation?.coordinates?.[1] ?? null,
        geolocation_long: entry.geolocation?.coordinates?.[0] ?? null,
      };
    });

    return res.status(200).json({
      message: 'Get 5 oldest hive observations',
      data: transformedResults
    });

  } catch (error) {
    console.error('getFirstFiveObservations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};