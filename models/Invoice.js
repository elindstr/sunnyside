const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection.js');

class Invoice extends Model {}
const Customer = require('./Customer');

Invoice.init(
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
    start_date: {
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
    amount_paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
          isDecimal: true
      },
      defaultValue: 0
    },
      content: {
          type: DataTypes.TEXT, 
    },
    stripe_invoice_id: {
      type: DataTypes.STRING, 
    },
    stripe_payment_url: {
      type: DataTypes.STRING, 
    }
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'invoice',
  }
);

module.exports = Invoice;
