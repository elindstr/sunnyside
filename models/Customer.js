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
