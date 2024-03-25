const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection.js');

class Customer extends Model {}
const Employee = require('./Employee');
const Product = require('./Product');

Customer.init(
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
    address: {
        type: DataTypes.STRING, 
    },
    phone: {
        type: DataTypes.STRING, 
    },
    email: {
        type: DataTypes.STRING, 
        validate: {
          isEmail: true
        } 
    },
    product_id: {
        type: DataTypes.INTEGER, 
        references: Product.id,
    },
    schedule: {
        type: DataTypes.STRING, 
    },
    employee_id: {
        type: DataTypes.INTEGER, 
        references: Employee.id,
    },
    account_balance: { // for tracking payments that don't equal invoice amount 
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
          isDecimal: true
      },
      defaultValue: 0
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
    modelName: 'customer',
  }
);

module.exports = Customer;
