const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection.js');
const bcrypt = require('bcrypt');

class User extends Model {
  checkPassword(loginPw) {
    return bcrypt.compareSync(loginPw, this.password);
  }
}
const Employee = require('./Employee');
const Customer = require('./Customer.js');

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING, 
      allowNull: false
    },
    password: {
        type: DataTypes.STRING, 
        allowNull: false,
        validate: {
          len: [8],
        },
      },
    access_level: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    employee_id: {
        type: DataTypes.INTEGER, 
        references: Employee.id
    },
    customer_id: {
        type: DataTypes.INTEGER, 
        references: Customer.id
    }
  },
  {
    hooks: {
      beforeCreate: async (newUserData) => {
        newUserData.password = await bcrypt.hash(newUserData.password, 10);
        return newUserData;
      },
      beforeUpdate: async (newUserData) => {
        newUserData.password = await bcrypt.hash(newUserData.password, 10);
        return newUserData;
      },
    },
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'user',
  }
);

module.exports = User;
