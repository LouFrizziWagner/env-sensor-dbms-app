# Sensor Database Application

## Description
This project benchmarks a document-oriented DBMS (MongoDB) and a relational DBMS(MySQL) for managing sensor data in environmental monitoring applications, using multi-sensor data from honey bee hives in Québec, Canada.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- MySQL, MongoDB
- `.env` file configured with:
```
DB_TYPE=mysql # or mongodb
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=sensordata

MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=sensordata
```

Install dependencies, run the server:

```
npm install

node main.js
```

Seed script for the database:
```
// MySQL
node ./database/insert-mysql.js

//MongoDB
node ./database/insert-mongodb.js
```






## Data Source
- **Dataset**: [MSPB - Multi-Sensor with Phenotypic Traits in Honey Bees](https://zenodo.org/records/11398835)  
- **Paper**: [arXiv:2311.10876](https://arxiv.org/abs/2311.10876)

## Dataset Description
Data was collected continuously from May 2020 to April 2021 across 53 hives in two apiaries. Sensors recorded:
- **Audio** (every 5 minutes)
- **Temperature** (every 15 minutes)
- **Humidity** (every 15 minutes)

Bi-weekly expert evaluations included:
- Hive population
- Brood cell counts
- Varroa infestation
- Honey yield
- Winter mortality

**D1**: April–October 2020 (Summer)  
**D2**: November 2020–April 2021 (Winter; used in this study)

## Sensor Data Columns

| Column                | Type                    | Description                          |
|-----------------------|-------------------------|--------------------------------------|
| `published_at`        | datetime with timezone  | UTC timestamp                        |
| `temperature`         | float                   | Celsius                              |
| `humidity`            | float                   | Percent                              |
| `tag_number`          | int                     | Hive ID                              |
| `beehub_name`         | string                  | Apiary name                          |
| `geolocation`         | string (WKT)            | Coordinates                          |
| `hive_power`          | float                   | Battery/power level                  |
| `hz_*`                | float                   | 16 frequency bins (audio features)   |
| `audio_density`       | float                   | Aggregate audio signal density       |
| `audio_density_ratio` | float                   | Normalized audio density             |
| `density_variation`   | float                   | Audio density variance               |

## Dataset Summary

| Data Set | Start Date     | End Date       | Days | Observations | Test | Notes                           |
|----------|----------------|----------------|------|--------------|------|---------------------------------|
| D1       | 2020-04-16 UTC | 2020-11-05 UTC | ~204 | 960,810      | No   | Spring–Fall 2020                |
| D2       | 2020-11-06 UTC | 2021-04-14 UTC | ~160 | 876,106      | No   | Winter 2020–21                  |
| D3 to D6    | 2021–2023      |                |      | 3.67M+       | Yes  | Synthetic, shifted by 1–2 years|

## Queries

### Monitoring
- `GET /get-max-temp/last-60-min` - Max temp in last hour
- `GET /get-all/last-24-hours` - All records from last 24 hours
- `GET /top-twenty-observations` - Top 20 observations (5-min interval)
- `GET /temp/humidity/average/all-time` - Global average temp/humidity
- `GET /beehub-names` - List of the apiary names

### Anomaly Detection
- `GET /time-between-observations/14-days` - Time gaps across all hives
- `GET /time-between-observations/14-days-august-interval` - 14-day interval gaps (August)

### Acoustic Analysis
- `GET /acoustic/variance/august-2020` - Frequency variance by hive (August 2020)
- `GET /acoustic/variance/april-2020-and-2021` - Frequency variance (April 2020 vs 2021)

### Humidity Stats
- `GET /humidity/min/august2020` - Min humidity (August 2020, first week)

### Load Testing
- `GET /bulk-read-1000` - Read 1,000 rows
- `GET /bulk-read-10000` - Read 10,000 rows
- `GET /bulk-read-20000` - Read 20,000 rows

### Insert Test
- `POST /single-observation-insert` - Insert one observation

## Limitations
Due to timestamp irregularities, only date-based aggregation is currently valid:
- Daily averages (temperature, humidity, power)a are valid
- 7-day trend or hourly patterns may be inaccurate

## Notes
- `tag_number` maps to `hive_sensor_id`  
