const sequelize = require('../config/connection');
const { Batch, Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../models');
const { format_date } = require('../utils/helpers');
const { generate } = require('../utils/generate-invoice');
const { Sequelize, Op } = require('sequelize');

const seedDatabase = async () => {
    await sequelize.sync({ force: true });
    const product = await Product.bulkCreate(seedProduct);
    
    const employee = await Employee.bulkCreate(seedEmployee);
    const customer = await Customer.bulkCreate(seedCustomer);
    
    const service = await Service.bulkCreate(seedService);
    const expense = await Expense.bulkCreate(seedExpense);

    const interaction = await Interaction.bulkCreate(seedInteraction);
    
    const user = await User.bulkCreate(seedUser, {
        individualHooks: true,
        returning: true,
      });
    
    await seedInvoices()
    await seedPayments()

    process.exit(0)
}

// seed data:
const seedProduct = [
    {
        "name": "Full Service",
        "rate": 37.5
    },
    {
        "name": "Chemicals Only",
        "rate": 18.75
    }
]
const seedEmployee = [
    {
        "id": 1,
        "first_name": "Ismael",
        "last_name": "Gautama",
        "email": "ismael@gmail.com",
        "role": "owner",
        "available_days": "mtwrf",
    },
    {
        "id": 2,
        "first_name": "Eve",
        "last_name": "Ma",
        "email": "evee@gmail.com",
        "role": "employee",
        "available_days": "mtwrf",
    },
    {
        "id": 3,
        "first_name": "Mario",
        "last_name": "Lopez",
        "email": "mlopez@gmail.com",
        "role": "employee",
        "available_days": "mtwrf",
    }
]

const seedCustomer = [
    {
        "id": 1,
        "first_name": "Alvin",
        "last_name": "Liu",
        "address": "221 Aspen Street",
        "phone": "916-111-1111",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": null,
        "employee_id": null,
    },
    {
        "id": 2,
        "first_name": "John",
        "last_name": "Smith",
        "address": "222 Elm Street",
        "phone": "916-222-2222",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": null,
        "employee_id": null,
    },
    {
        "id": 3,
        "first_name": "Allison",
        "last_name": "Jackson",
        "address": "333 Oak Street",
        "phone": "916-333-3333",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": null,
        "employee_id": null,
    },
    {
        "id": 4,
        "first_name": "Paul",
        "last_name": "Alba",
        "address": "444 Redwood Street",
        "phone": "916-444-4444",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "W",
        "employee_id": 1,
    },
    {
        "id": 5,
        "first_name": "Daniella",
        "last_name": "Morales",
        "address": "444 Pine Street",
        "phone": "916-555-5555",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "W",
        "employee_id": 1,
    },
    {
        "id": 6,
        "first_name": "David",
        "last_name": "Anderson",
        "address": "552 Magnolia Street",
        "phone": "916-666-6666",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "F",
        "employee_id": 2,
    },
    {
        "id": 7,
        "first_name": "Jerry",
        "last_name": "Garagos",
        "address": "552 Cypress Street",
        "phone": "916-777-7777",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "F",
        "employee_id": 2,
    },
    {
        "id": 8,
        "first_name": "Harry",
        "last_name": "Hu",
        "address": "717 Sycamore Street",
        "phone": "916-888-8888",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "R",
        "employee_id": 3,
    },
    {
        "id": 9,
        "first_name": "Amandine",
        "last_name": "Lejeune",
        "address": "552 Cherry Street",
        "phone": "916-999-9999",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "R",
        "employee_id": 3,
    }
]
const seedUser = [
    {
        "id": 1,
        "username": "admin",
        "password": "password",
        "access_level": "admin",
        "employee_id": 1
    },
    {
        "id": 2,
        "username": "employee",
        "password": "password",
        "access_level": "employee",
        "employee_id": 2
    },
    {
        "id": 3,
        "username": "mario",
        "password": "password",
        "access_level": "employee",
        "employee_id": 3
    },
    {
        "id": 4,
        "username": "customer",
        "password": "password",
        "access_level": "customer",
        "customer_id": 1
    }
]
const seedInteraction = [
    {
        "date": "2024-02-01",
        "employee_id": 1,
        "customer_id": 1, 
        "note": "I told him he needs to trim his tree, or we'll have to charge him extra because it drops so many leaves. Let's remind him next month."
    },
    {
        "date": "2024-03-01",
        "employee_id": 1,
        "customer_id": 1, 
        "note": "I talked with him about the tree again. It's taken care of"
    },
    {
        "date": "2024-02-01",
        "employee_id": 1,
        "customer_id": 2, 
        "note": "I told him he needs to trim his tree, or we'll have to charge him extra because it drops so many leaves. Let's remind him next month."
    },
    {
        "date": "2024-03-01",
        "employee_id": 1,
        "customer_id": 2, 
        "note": "I talked with him about the tree again. It's taken care of"
    },
    {
        "date": "2024-02-01",
        "employee_id": 1,
        "customer_id": 3, 
        "note": "I told him he needs to trim his tree, or we'll have to charge him extra because it drops so many leaves. Let's remind him next month."
    },
    {
        "date": "2024-03-01",
        "employee_id": 1,
        "customer_id": 3, 
        "note": "I talked with him about the tree again. It's taken care of"
    },
    {
        "date": "2024-02-01",
        "employee_id": 1,
        "customer_id": 4, 
        "note": "I told him he needs to trim his tree, or we'll have to charge him extra because it drops so many leaves. Let's remind him next month."
    },
    {
        "date": "2024-03-01",
        "employee_id": 1,
        "customer_id": 4, 
        "note": "I talked with him about the tree again. It's taken care of"
    },
    {
        "date": "2024-02-01",
        "employee_id": 1,
        "customer_id": 5, 
        "note": "I told him he needs to trim his tree, or we'll have to charge him extra because it drops so many leaves. Let's remind him next month."
    },
    {
        "date": "2024-03-01",
        "employee_id": 1,
        "customer_id": 5, 
        "note": "I talked with him about the tree again. It's taken care of"
    }
]

let seedService = []
let seedExpense = []
let serviceDate = new Date(2023, 0, 2);
let stopDate = new Date(2024, 2, 30);
while (serviceDate < stopDate) {
    for (let c = 1; c < 8; c++) {
        seedService.push({
            "date": format_date(serviceDate),
            "employee_id": Math.floor(Math.random() * 2) + 1,
            "customer_id": c,
            "product_id": 1
        })
    }
    seedExpense.push({
        "date": format_date(serviceDate),
        "employee_id": Math.floor(Math.random() * 2) + 1,
        "customer_id": Math.floor(Math.random() * 8) + 1,
        "amount": 20.75,
        "description": "replace filter"
    })
    serviceDate.setDate(serviceDate.getDate() + 7);
}

async function seedInvoices() {
    let invoice_start_date = new Date(2023, 0, 1);
    let invoice_end_date = new Date(2023, 1, 2);
    let stopLoopDate = new Date(2024, 2, 1);
    while (invoice_end_date < stopLoopDate) {
        for (let c = 1; c < 9; c++) {
            await generate(c, format_date(invoice_end_date), format_date(invoice_start_date), format_date(invoice_end_date))
            await Batch.create({
                date: format_date(invoice_end_date),
                end_date: format_date(invoice_end_date)
            })
        }
        invoice_start_date.setDate(invoice_start_date.getDate() + 30);
        invoice_end_date.setDate(invoice_end_date.getDate() + 30);
    }
}

async function seedPayments() {
    let date = new Date(2023, 0, 20);
    let stopLoopDate = new Date(2024, 2, 1);
    while (date < stopLoopDate) {
        for (let c = 1; c < 9; c++) {

            // look up most recent invoice
            invoiceData = await Invoice.findAll({
                where: { 
                    customer_id: c,
                    date: {
                        [Sequelize.Op.lte]: date
                        }
                },
                order: [['date', 'DESC']]
            })

            // pay it
            if (invoiceData.length) {
                await Payment.create({ 
                    customer_id: c, 
                    amount: invoiceData[0].amount , 
                    date, 
                    invoice_id: invoiceData[0].id 
                })
                await Invoice.update({
                    amount_paid: invoiceData[0].amount
                },
                {
                    where: { id: invoiceData[0].id }
                });
            }

        }
        date.setDate(date.getDate() + 30);
    }
}


seedDatabase()



