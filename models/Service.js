const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection.js');

class Service extends Model {}
const Employee = require('./Employee');
const Customer = require('./Customer');
const Invoice = require('./Invoice');

Service.init(
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
    },
    invoice_id: {
        type: DataTypes.INTEGER, 
        references: Invoice.id,
    }
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'service',
  }
);

module.exports = Service;
