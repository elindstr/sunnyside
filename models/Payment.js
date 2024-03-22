const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection.js');

class Payment extends Model {}
const Customer = require('./Customer');
const Invoice = require('./Invoice');

Payment.init(
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
    customer_id: {
        type: DataTypes.INTEGER, 
        references: Customer.id,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: true
        }
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
    modelName: 'payment',
  }
);

module.exports = Payment;
