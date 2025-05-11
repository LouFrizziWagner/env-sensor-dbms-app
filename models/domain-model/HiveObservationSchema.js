// models/hiveObservationSchema.js
export default {
    id: 'number',
    published_at: 'date',
    temperature: 'number',
    humidity: 'number',
    hive_sensor_id: 'number',
    beehub_name: 'string',
    geolocation: {
      type: 'point', // own types
      lat: 'number',
      long: 'number'
    },
    hive_power: 'number',
    date: 'date',
    time: 'string',
    audio_density: 'number',
    audio_density_ratio: 'number',
    density_variation: 'number',
    is_test_data: 'boolean',
    frequencies: [
      'hz_122_0703125',
      'hz_152_587890625',
      // ...rest of 20 audio featurs
      'hz_579_833984375'
    ]
  };