// This seed file takes about 12 minutes to complete. For a faster seed file, without invoice or payment data, use seed-lite.js. 

// implementing sleep function to avoid overwhelming out database 
    // code: 'ER_USER_LIMIT_REACHED',
    // errno: 1226,
    // sqlState: '42000',
    // sqlMessage: "User 'm884f8txttj9wr85' has exceeded the 'max_questions' resource (current value: 3600)",
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const sequelize = require('../config/connection');
const { Batch, Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../models');
const { format_date } = require('../utils/helpers');
const { generate } = require('../utils/generate-invoice');
const { Sequelize, Op } = require('sequelize');

const seedDatabase = async () => {
    await sequelize.sync({ force: true });
    await Product.bulkCreate(seedProduct);
    await Employee.bulkCreate(seedEmployee);
    await Customer.bulkCreate(seedCustomer);

    await createServicesandExpensesData()
    await Service.bulkCreate(seedService);
    await Expense.bulkCreate(seedExpense);
    await Interaction.bulkCreate(seedInteraction);
    
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
        "schedule": "M",
        "employee_id": 1,
    },
    {
        "id": 2,
        "first_name": "John",
        "last_name": "Smith",
        "address": "222 Elm Street",
        "phone": "916-222-2222",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "T",
        "employee_id": 1,
    },
    {
        "id": 3,
        "first_name": "Allison",
        "last_name": "Jackson",
        "address": "333 Oak Street",
        "phone": "916-333-3333",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "W",
        "employee_id": 1,
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
    },
    {
        "id": 10,
        "first_name": "Aarav",
        "last_name": "Brown",
        "address": "778 Cypress Street",
        "phone": "916-788-8426",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "W",
        "employee_id": 3
    },
    {
        "id": 11,
        "first_name": "Liam",
        "last_name": "Gupta",
        "address": "498 Oak Street",
        "phone": "916-407-6164",
        "email": "elindstr@gmail.com",
        "product_id": 2,
        "schedule": "T",
        "employee_id": 3
    },
    {
        "id": 12,
        "first_name": "Fatima",
        "last_name": "Johnson",
        "address": "709 Alder Street",
        "phone": "916-626-8687",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "T",
        "employee_id": 3
    },
    {
        "id": 13,
        "first_name": "Chen",
        "last_name": "Jones",
        "address": "299 Redwood Street",
        "phone": "916-284-9362",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "W",
        "employee_id": 1
    },
    {
        "id": 14,
        "first_name": "Mohamed",
        "last_name": "Silva",
        "address": "265 Alder Street",
        "phone": "916-745-5422",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "R",
        "employee_id": 1
    },
    {
        "id": 15,
        "first_name": "Al",
        "last_name": "Smith",
        "address": "1241 Cork Street",
        "phone": "916-234-5422",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "M", 
        "employee_id": 3
    },
    {
        "id": 16,
        "first_name": "Ella",
        "last_name": "Morgan",
        "address": "116 Main Street",
        "phone": "916-116-1016",
        "email": "elindstr@gmail.com",
        "product_id": 2,
        "schedule": "T",
        "employee_id": 2
    },
    {
        "id": 17,
        "first_name": "Noah",
        "last_name": "Bennett",
        "address": "117 Main Street",
        "phone": "916-117-1017",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "W",
        "employee_id": 3
    },
    {
        "id": 18,
        "first_name": "Mia",
        "last_name": "Phillips",
        "address": "118 Main Street",
        "phone": "916-118-1018",
        "email": "elindstr@gmail.com",
        "product_id": 2,
        "schedule": "R",
        "employee_id": 1
    },
    {
        "id": 19,
        "first_name": "Lucas",
        "last_name": "Garcia",
        "address": "119 Main Street",
        "phone": "916-119-1019",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "F",
        "employee_id": 2
    },
    {
        "id": 20,
        "first_name": "Amelia",
        "last_name": "Martinez",
        "address": "120 Main Street",
        "phone": "916-120-1020",
        "email": "elindstr@gmail.com",
        "product_id": 2,
        "schedule": "M",
        "employee_id": 3
    },
    {
        "id": 21,
        "first_name": "Oliver",
        "last_name": "Jackson",
        "address": "121 Main Street",
        "phone": "916-121-1021",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "T",
        "employee_id": 1
    },
    {
        "id": 22,
        "first_name": "Sophia",
        "last_name": "Lopez",
        "address": "122 Main Street",
        "phone": "916-122-1022",
        "email": "elindstr@gmail.com",
        "product_id": 2,
        "schedule": "W",
        "employee_id": 2
    },
    {
        "id": 23,
        "first_name": "Ethan",
        "last_name": "Wilson",
        "address": "123 Main Street",
        "phone": "916-123-1023",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "R",
        "employee_id": 3
    },
    {
        "id": 24,
        "first_name": "Ava",
        "last_name": "Martinez",
        "address": "124 Main Street",
        "phone": "916-124-1024",
        "email": "elindstr@gmail.com",
        "product_id": 2,
        "schedule": "F",
        "employee_id": 1
    },
    {
        "id": 25,
        "first_name": "William",
        "last_name": "Anderson",
        "address": "125 Main Street",
        "phone": "916-125-1025",
        "email": "elindstr@gmail.com",
        "product_id": 1,
        "schedule": "M",
        "employee_id": 2
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
seedService.push(
    {
        "date": '2024-04-01',
        "employee_id": 1,
        "customer_id": 1,
        "product_id": 1
    },
    {
        "date": '2024-04-01',
        "employee_id": 1,
        "customer_id": 15,
        "product_id": 1
    },
    {
        "date": '2024-04-01',
        "employee_id": 1,
        "customer_id": 20,
        "product_id": 1
    },
    {
        "date": '2024-04-01',
        "employee_id": 1,
        "customer_id": 25,
        "product_id": 1
    },
    {
        "date": '2024-04-02',
        "employee_id": 1,
        "customer_id": 2,
        "product_id": 1
    },
    {
        "date": '2024-04-02',
        "employee_id": 1,
        "customer_id": 11,
        "product_id": 1
    },
    {
        "date": '2024-04-02',
        "employee_id": 1,
        "customer_id": 12,
        "product_id": 1
    },
    {
        "date": '2024-04-02',
        "employee_id": 1,
        "customer_id": 16,
        "product_id": 1
    },
    {
        "date": '2024-04-02',
        "employee_id": 1,
        "customer_id": 21,
        "product_id": 1
    },
    {
        "date": '2024-04-03',
        "employee_id": 1,
        "customer_id": 3,
        "product_id": 1
    },
    {
        "date": '2024-04-03',
        "employee_id": 1,
        "customer_id": 4,
        "product_id": 1
    },
    {
        "date": '2024-04-03',
        "employee_id": 1,
        "customer_id": 5,
        "product_id": 1
    },
    {
        "date": '2024-04-03',
        "employee_id": 1,
        "customer_id": 10,
        "product_id": 1
    },
    {
        "date": '2024-04-03',
        "employee_id": 1,
        "customer_id": 13,
        "product_id": 1
    },
    {
        "date": '2024-04-03',
        "employee_id": 1,
        "customer_id": 17,
        "product_id": 1
    },
    {
        "date": '2024-04-03',
        "employee_id": 1,
        "customer_id": 22,
        "product_id": 1
    }
)
let seedExpense = []
async function createServicesandExpensesData() {
    let customers = await Customer.findAll({ raw: true });
    let serviceDate = new Date(2023, 10, 2);
    let stopDate = new Date(2024, 2, 30);

    while (serviceDate < stopDate) {
        for (let customer of customers) {
            seedService.push({
                "date": format_date(serviceDate),
                "employee_id": Math.floor(Math.random() * 2) + 1,
                "customer_id": customer.id,
                "product_id": customer.product_id
            });            
            // Randomly add expenses
            if (Math.random() < .05) {
                seedExpense.push({
                    "date": format_date(serviceDate),
                    "employee_id": Math.floor(Math.random() * 2) + 1,
                    "customer_id": Math.floor(Math.random() * 8) + 1,
                    "amount": 20.75,
                    "description": "replace filter"
                });
            }
        }
        serviceDate.setDate(serviceDate.getDate() + 7);
    }
}

async function seedInvoices() {
    let invoice_start_date = new Date(2023, 10, 1);
    let invoice_end_date = new Date(2023, 11, 2);
    let stopLoopDate = new Date(2024, 3, 1);
    while (invoice_end_date <= stopLoopDate) {
        for (let c = 1; c < seedCustomer.length+1; c++) {
            await generate(c, format_date(invoice_end_date), format_date(invoice_start_date), format_date(invoice_end_date), type="seed")
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
    let date = new Date(2023, 11, 20);
    let stopLoopDate = new Date(2024, 2, 20);
    while (date <= stopLoopDate) {
        for (let c = 1; c < seedCustomer.length+1; c++) {

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

    // Randomly delete a few payments
    const paymentData = await Payment.findAll({
        order: [['date', 'DESC']],
        limit: 50,
        raw: true
    });

    // Start from the last index, which is paymentIds.length - 1
    for (let i = paymentData.length - 1; i >= 0; i--) {
        if (Math.random() < 0.1) {  // 10% missed payments
            if (paymentData[i]) {

                // Update invoice
                await Invoice.update(
                    { amount_paid: 0 },
                    { where: { id: paymentData[i].invoice_id } }
                );

                // Delete payment
                await Payment.destroy({
                    where: { id: paymentData[i].id }
                });
            }
        }
    }
}



seedDatabase()



