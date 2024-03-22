const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection.js');

class Interaction extends Model {}
const Employee = require('./Employee');
const Customer = require('./Customer');

Interaction.init(
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
    employee_id: {
        type: DataTypes.INTEGER, 
        references: Employee.id,
        allowNull: false,

    },
    customer_id: {
        type: DataTypes.INTEGER, 
        references: Customer.id,
        allowNull: false,
    },
    note: {
        type: DataTypes.STRING, 
    }
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'interaction',
  }
);

module.exports = Interaction;
