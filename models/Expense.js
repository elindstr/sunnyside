const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection.js');

class Expense extends Model {}
const Employee = require('./Employee');
const Customer = require('./Customer');
const Invoice = require('./Invoice');

Expense.init(
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
    },
    customer_id: {
        type: DataTypes.INTEGER, 
        references: Customer.id,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true
        }
    },
    description: {
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
    modelName: 'expense',
  }
);

module.exports = Expense;
