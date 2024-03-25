const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection.js');

class Employee extends Model {}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataTypes.STRING, 
      allowNull: false
    },
    last_name: {
        type: DataTypes.STRING, 
        allowNull: false
      },
    email: {
        type: DataTypes.STRING,
        validate: {
          isEmail: true
        } 
    },
    role: {
        type: DataTypes.STRING, 
    },
    available_days: {
        type: DataTypes.STRING, 
    },
    is_deleted: {
      type: DataTypes.BOOLEAN, 
      defaultValue: false
    }
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'employee',
  }
);

module.exports = Employee;
