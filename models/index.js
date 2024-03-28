// import models
// const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('./');
const Batch = require('./Batch');
const Customer = require('./Customer');
const Employee = require('./Employee');
const Expense = require('./Expense');
const Interaction = require('./Interaction');
const Invoice = require('./Invoice');
const Payment = require('./Payment');
const Product = require('./Product');
const Service = require('./Service');
const User = require('./User');

// Customer foreign keys
Customer.belongsTo(Product, {
    foreignKey: 'product_id'
});
Product.hasMany(Customer, {
    foreignKey: 'product_id',
});
Customer.belongsTo(Employee, {
    foreignKey: 'employee_id'
});
Employee.hasMany(Customer, {
    foreignKey: 'employee_id',
});

// Invoice foreign keys
Invoice.belongsTo(Customer, {
    foreignKey: 'customer_id'
});
Customer.hasMany(Invoice, {
    foreignKey: 'customer_id',
});

// Payment foreign keys
Payment.belongsTo(Customer, {
    foreignKey: 'customer_id'
});
Customer.hasMany(Payment, {
    foreignKey: 'customer_id',
});
Payment.belongsTo(Invoice, {
    foreignKey: 'invoice_id'
});
Invoice.hasOne(Payment, {
    foreignKey: 'invoice_id',
});

// Expense foreign keys
Expense.belongsTo(Employee, {
    foreignKey: 'employee_id'
});
Employee.hasMany(Expense, {
    foreignKey: 'employee_id',
    onDelete: 'SET NULL'
});
Expense.belongsTo(Customer, {
    foreignKey: 'customer_id'
});
Customer.hasMany(Expense, {
    foreignKey: 'customer_id',
    onDelete: 'SET NULL'
});
Expense.belongsTo(Invoice, {
    foreignKey: 'invoice_id'
});
Invoice.hasMany(Expense, {
    foreignKey: 'invoice_id',
    onDelete: 'SET NULL'
});

// Service foreign keys
Service.belongsTo(Employee, {
    foreignKey: 'employee_id'
});
Employee.hasMany(Service, {
    foreignKey: 'employee_id',
    onDelete: 'SET NULL'
});
Service.belongsTo(Customer, {
    foreignKey: 'customer_id'
});
Customer.hasMany(Service, {
    foreignKey: 'customer_id',
    onDelete: 'SET NULL'
});
Service.belongsTo(Invoice, {
    foreignKey: 'invoice_id'
});
Invoice.hasMany(Service, {
    foreignKey: 'invoice_id',
    onDelete: 'SET NULL'
});
Service.belongsTo(Product, {
    foreignKey: 'product_id'
});
Product.hasMany(Service, {
    foreignKey: 'product_id',
    onDelete: 'SET NULL'
});

// User foreign keys
User.belongsTo(Customer, {
    foreignKey: 'customer_id',
    constraints: false,
    scope: {
      userableType: 'customer'
    }
});
Customer.hasOne(User, {
    foreignKey: 'customer_id',
    constraints: false,
    scope: {
      userableType: 'customer'
    }
});
User.belongsTo(Employee, {
    foreignKey: 'employee_id',
    constraints: false,
    scope: {
      userableType: 'employee'
    }
});
Employee.hasOne(User, {
    foreignKey: 'employee_id',
    constraints: false,
    scope: {
      userableType: 'employee'
    }
});

module.exports = { Batch, Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User }