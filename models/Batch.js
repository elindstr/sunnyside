const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection.js');

class Batch extends Model {}

Batch.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
          isDate: true
      }
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
          isDate: true
      }
    }
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'batch',
  }
);

module.exports = Batch;
