import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/mysqlConfig.js';

class SensorData extends Model {}

SensorData.init(
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
      allowNull: false,
    },
    humidity: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    tag_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    beehub_name: {
      type: DataTypes.STRING,
      allowNull: false,
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
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    audio_density: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    audio_density_ratio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    density_variation: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    // Frequency-related fields
    hz_122_0703125: { type: DataTypes.FLOAT, allowNull: false },
    hz_152_587890625: { type: DataTypes.FLOAT, allowNull: false },
    hz_183_10546875: { type: DataTypes.FLOAT, allowNull: false },
    hz_213_623046875: { type: DataTypes.FLOAT, allowNull: false },
    hz_244_140625: { type: DataTypes.FLOAT, allowNull: false },
    hz_274_658203125: { type: DataTypes.FLOAT, allowNull: false },
    hz_305_17578125: { type: DataTypes.FLOAT, allowNull: false },
    hz_335_693359375: { type: DataTypes.FLOAT, allowNull: false },
    hz_366_2109375: { type: DataTypes.FLOAT, allowNull: false },
    hz_396_728515625: { type: DataTypes.FLOAT, allowNull: false },
    hz_427_24609375: { type: DataTypes.FLOAT, allowNull: false },
    hz_457_763671875: { type: DataTypes.FLOAT, allowNull: false },
    hz_488_28125: { type: DataTypes.FLOAT, allowNull: false },
    hz_518_798828125: { type: DataTypes.FLOAT, allowNull: false },
    hz_549_31640625: { type: DataTypes.FLOAT, allowNull: false },
    hz_579_833984375: { type: DataTypes.FLOAT, allowNull: false },
  },
  {
    sequelize,
    modelName: 'SensorData',
    tableName: 'sensor_data',
    timestamps: false,
  }
);

export default SensorData;
