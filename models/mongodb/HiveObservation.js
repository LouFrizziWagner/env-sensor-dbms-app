import mongoose from 'mongoose';

const HiveObservationSchema = new mongoose.Schema(
  {
    //id automatically handled by mongodb
    published_at: { type: Date, required: true }, // ISO 8601 string with timezone offset
    temperature: { type: Number }, // in celcius
    humidity: { type: Number }, // in percent

    // hive_sensor_id is unique for the hive sensor (renamed tag_number in csv)
    hive_sensor_id: { type: Number, required: true },

    beehub_name: { type: String, required: true },

    
    // GeoJSON geolocation, defaulting to point (0, 0)
    geolocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },

    lat: { type: Number, default: 0.0 },
    long: { type: Number, default: 0.0 },

    hive_power: { type: Number },
    date: { type: Date }, // Sequelize used DATEONLY, Date is fine in Mongo
    time: { type: String }, // Sequelize used TIME, String works in Mongo

    audio_density: { type: Number },
    audio_density_ratio: { type: Number },
    density_variation: { type: Number },

    is_test_data: {
      type: Boolean,
      default: false
    },

    // Frequency fields
    hz_122_0703125: { type: Number },
    hz_152_587890625: { type: Number },
    hz_183_10546875: { type: Number },
    hz_213_623046875: { type: Number },
    hz_244_140625: { type: Number },
    hz_274_658203125: { type: Number },
    hz_305_17578125: { type: Number },
    hz_335_693359375: { type: Number },
    hz_366_2109375: { type: Number },
    hz_396_728515625: { type: Number },
    hz_427_24609375: { type: Number },
    hz_457_763671875: { type: Number },
    hz_488_28125: { type: Number },
    hz_518_798828125: { type: Number },
    hz_549_31640625: { type: Number },
    hz_579_833984375: { type: Number }
  },
  {
    collection: 'hive_observations',
    timestamps: false,
    strict: true
  }
);

// Indexes
//HiveObservationSchema.index({ geolocation: '2dsphere' });
// Compound unique index on (published_at)
HiveObservationSchema.index(
  { published_at: 1},
  { unique: false }
);

const HiveObservation = mongoose.model('HiveObservation', HiveObservationSchema);
export default HiveObservation;