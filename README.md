# Sensor Database Application
## Benchmarking a Document DBMS and a Relational DBMS for managing sensor data in environmental monitoring applications

Source of Test data: ([MSPB: a longitudinal multi-sensor dataset with phenotypic trait measurements from honey bees](https://zenodo.org/records/11398835))
Publication of Paper of the data (https://arxiv.org/abs/2311.10876)

Data description (rewrite)
We present a longitudinal Multi-Sensor dataset with Phenotypic trait measurements from honey Bees (MSPB). Data were continuously collected between May-2020 and April-2021 from 53 hives located at two apiaries in Québec, Canada. The sensor data included audio features, temperature, and relative humidity. The phenotypic measurements contained beehive population, number of brood cells (eggs, larva and pupa), Varroa destructor infestation levels, defensive and hygienic behaviors, honey yield, and winter mortality. Our study is amongst the first to provide a wide variety of phenotypic trait measurements annotated by apicultural science experts, which facilitate a broader scope of analysis on honey bees, such as bee acoustics analysis, multi-modal hive monitoring, queen presence detection, Varroa infection detection, hive population estimation, biological analysis of bees, etc.

between April, 2020 and October, 2020 received a ‘D1’ (Summer Data)
between October, 2020 and April, 2021 were labelled as ‘D2’ (Winter Data)

Here we use Winter Data (about 200mb csv)

(from paper:)
D1 and D2 sensor data are both paired with (1) the time stamp (date and time) of the data collection, (2) hive ID, which is a
unique number to identify each hive, (3) apiary ID, which indicates the apiary location of the hive, (4) temperature values, (5)
relative humidity values, and (6) twenty audio features. The D1 phenotypic traits file has three sub-sheets, which details (1) the
visit date and time of the human evaluations, as well as the evaluation tasks, (2) the population size of the colonies measured at
each visit, (3) other phenotypic trait measurements, such as Varroa infestation levels, defensive and hygienic behavior, honey
yield, etc. During the period of D2, hives were maintained in the winter chambers and only evaluated once in the Spring to
check their winter survival rate. Hence, the D2 phenotypic traits file contains the survival status, as well as the mortality causes
(if any) of all hives.

## Sensors
of audio, temperature, and relative humidity data
recorded from a large number of hives located in Québec, Canada during a one-year period

This sensor is capable of concurrent
recording of audio, relative humidity, and temperature data at regular intervals of 5 min, 15 min, and 15 min respectively. The
recorded sensor data is wirelessly transmitted to a central data aggregator powered by solar energy and securely stored in the
cloud. The sensor data was collected 24 hours a day, 7 days per week from May 2020 to June 2021. Besides continuous sensor
recording, apicultural science experts visited hives bi-weekly to monitor the hive status and conducted evaluations on a regular
basis. Colony phenotypic trait measurements, such as honey bee population, honey yield, and health status, were also collected,
hence providing valuable context to interpret the sensor data.

24 hours a day, 7 days per week from May 2020 to June 2021(D1 and D2 csv)
audio every 5min
humidty collected every 15min
temperature every 15min
hive status and bee population every 14 days

(1) a multi-modal sensor system with continuous data
recording, and (2) phenotypic traits annotated by apicultural science experts on a bi-weekly basis

## Data 

| #  | Column Name             | Data Type             | Description                                                                 |
|----|-------------------------|------------------------|-----------------------------------------------------------------------------|
| 1  | `published_at`          | datetime with timezone | Full UTC timestamp when the data was recorded                              |
| 2  | `temperature`           | float                  | Temperature in degrees Celsius                                              |
| 3  | `humidity`              | float                  | Relative humidity in percent                                                |
| 4  | `tag_number`            | integer                | Unique ID for each hive                                                     |
| 5  | `beehub_name`           | string                 | Name of the beehub or apiary location                                       |
| 6  | `geolocation`           | string (WKT format)    | Geo-location point (latitude and longitude)                                 |
| 7  | `hive_power`            | float                  | Battery or power status of the hive sensor                                  |
| 8  | `lat`                   | float                  | Latitude (may be placeholder)                                               |
| 9  | `long`                  | float                  | Longitude (may be placeholder)                                              |
| 10 | `date`                  | date                   | Date portion of `published_at`                                              |
| 11 | `time`                  | time                   | Time portion of `published_at`                                              |
| 12 | `hz_122.0703125`        | float                  | Audio feature at 122.07 Hz                                                  |
| 13 | `hz_152.587890625`      | float                  | Audio feature at 152.59 Hz                                                  |
| 14 | `hz_183.10546875`       | float                  | Audio feature at 183.11 Hz                                                  |
| 15 | `hz_213.623046875`      | float                  | Audio feature at 213.62 Hz                                                  |
| 16 | `hz_244.140625`         | float                  | Audio feature at 244.14 Hz                                                  |
| 17 | `hz_274.658203125`      | float                  | Audio feature at 274.66 Hz                                                  |
| 18 | `hz_305.17578125`       | float                  | Audio feature at 305.18 Hz                                                  |
| 19 | `hz_335.693359375`      | float                  | Audio feature at 335.69 Hz                                                  |
| 20 | `hz_366.2109375`        | float                  | Audio feature at 366.21 Hz                                                  |
| 21 | `hz_396.728515625`      | float                  | Audio feature at 396.73 Hz                                                  |
| 22 | `hz_427.24609375`       | float                  | Audio feature at 427.25 Hz                                                  |
| 23 | `hz_457.763671875`      | float                  | Audio feature at 457.76 Hz                                                  |
| 24 | `hz_488.28125`          | float                  | Audio feature at 488.28 Hz                                                  |
| 25 | `hz_518.798828125`      | float                  | Audio feature at 518.80 Hz                                                  |
| 26 | `hz_549.31640625`       | float                  | Audio feature at 549.32 Hz                                                  |
| 27 | `hz_579.833984375`      | float                  | Audio feature at 579.83 Hz                                                  |
| 28 | `audio_density`         | float                  | Summary metric of audio signal density                                      |
| 29 | `audio_density_ratio`   | float                  | Normalized ratio of audio density                                           |
| 30 | `density_variation`     | float                  | Variation or standard deviation in audio density                            |


## Simple Environmental Sensor Monitoring Queries


### Basic Monitoring

- **Average Temperature Per Hive Per Day**
  > `What is the average temperature for each hive on a daily basis?`

- **Average Humidity Per Hive Per Day**
  > `What is the average relative humidity recorded in each hive per day?`

- **Daily Max/Min Hive Power**
  > `What is the maximum and minimum hive power for each hive every day?`

- **Hourly Temperature Trends**
  > `How does temperature change across 24 hours for each hive?`

- **Top Active / Inactive Hives**
  > `Which hives have the highest or lowest hive power over the past 7 days?`

---

### Anomaly Detection

- **Sudden Spikes or Drops in Temperature / Humidity**
  > `Are there any sudden spikes or drops in temperature or humidity readings?`

- **Flat Audio Signal Detection**
  > `Are there hives showing no change in hive power for extended periods (e.g., multiple hours/days)?`

- **High Audio Variation**
  > `Which hives have consistently high audio band density variation (ABDR)?`

---

### Comparative Queries

- **Environment Comparison Across Apiaries**
  > `How do average temperature and humidity levels differ between apiary locations?`

- **Humidity Outliers**
  > `Are some hives regularly above or below the expected humidity range (50–60%)?`

---

### Trend-Based Monitoring

- **Weekly Hive Power Trends**
  > `How does average hive power evolve on a weekly basis for each hive?`

- **Temperature vs Hive Power Correlation**
  > `Is there a significant correlation between internal hive temperature and hive power (audio activity)?`

## Current Test Data has not correct time stamps.
This means:
- Average Temperature Per Hive Per Day
- Average Humidity Per Hive Per Day
- Daily Max/Min Hive Power
can be tested correctly.

But queries like:
- Top Active / Inactive Hives (Last 7 days)
- Hourly Temperature Trends
need logically correct time stamps.