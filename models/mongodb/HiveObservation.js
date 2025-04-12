import mongoose from 'mongoose';

const HiveObservationSchema = new mongoose.Schema(
  {
    published_at: { type: Date, required: true }, // Timestamp of the reading
    temperature: { type: Number, required: true }, // Temperature in °C
    humidity: { type: Number, required: true }, // Humidity percentage
    tag_number: { type: Number, required: true }, // Unique tag for the hive/sensor
    beehub_name: { type: String, required: true }, // Beehub name
    geolocation: { type: String, required: false }, // WKT point representation
    lat: { type: Number, required: true }, // Latitude
    long: { type: Number, required: true }, // Longitude
    hive_power: { type: Number, required: true }, // Hive power reading
    date: { type: Date, required: true }, // Date of reading
    time: { type: String, required: true }, // Time of reading

    // Frequency-related fields
    audio_frequencies: {
      "122.0703125": { type: Number, required: true },
      "152.587890625": { type: Number, required: true },
      "183.10546875": { type: Number, required: true },
      "213.623046875": { type: Number, required: true },
      "244.140625": { type: Number, required: true },
      "274.658203125": { type: Number, required: true },
      "305.17578125": { type: Number, required: true },
      "335.693359375": { type: Number, required: true },
      "366.2109375": { type: Number, required: true },
      "396.728515625": { type: Number, required: true },
      "427.24609375": { type: Number, required: true },
      "457.763671875": { type: Number, required: true },
      "488.28125": { type: Number, required: true },
      "518.798828125": { type: Number, required: true },
      "549.31640625": { type: Number, required: true },
      "579.833984375": { type: Number, required: true },
    },

    audio_density: { type: Number, required: true }, // Audio density value
    audio_density_ratio: { type: Number, required: true }, // Ratio of audio density
    density_variation: { type: Number, required: true }, // Variation in density
  },
  {
    collection: 'sensor_data',
    timestamps: false,
  }
);

const HiveObservation = mongoose.model('HiveObservation', HiveObservationSchema);
export default HiveObservation;
