import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/mysql-config.js';

class HiveObservation extends Model {}

HiveObservation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    humidity: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    hive_sensor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    beehub_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    geolocation: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: true,
    },
    lat: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    long: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    hive_power: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    audio_density: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    audio_density_ratio: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    density_variation: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    // Audio Frequency Measurements
    hz_122_0703125: { type: DataTypes.FLOAT, allowNull: true },
    hz_152_587890625: { type: DataTypes.FLOAT, allowNull: true },
    hz_183_10546875: { type: DataTypes.FLOAT, allowNull: true },
    hz_213_623046875: { type: DataTypes.FLOAT, allowNull: true },
    hz_244_140625: { type: DataTypes.FLOAT, allowNull: true },
    hz_274_658203125: { type: DataTypes.FLOAT, allowNull: true },
    hz_305_17578125: { type: DataTypes.FLOAT, allowNull: true },
    hz_335_693359375: { type: DataTypes.FLOAT, allowNull: true },
    hz_366_2109375: { type: DataTypes.FLOAT, allowNull: true },
    hz_396_728515625: { type: DataTypes.FLOAT, allowNull: true },
    hz_427_24609375: { type: DataTypes.FLOAT, allowNull: true },
    hz_457_763671875: { type: DataTypes.FLOAT, allowNull: true },
    hz_488_28125: { type: DataTypes.FLOAT, allowNull: true },
    hz_518_798828125: { type: DataTypes.FLOAT, allowNull: true },
    hz_549_31640625: { type: DataTypes.FLOAT, allowNull: true },
    hz_579_833984375: { type: DataTypes.FLOAT, allowNull: true },
    is_test_data: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'HiveObservation',
    indexes: [
      {
        fields: ['published_at']
        //hive id or beehub name
      }
    ],
    tableName: 'hive_observations',
    timestamps: false,
  }
);

export default HiveObservation;
