const sequelize = require('../config/connection');
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../models');

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
    
    //const invoice = await Invoice.bulkCreate(userInvoice);
    //const payment = await Payment.bulkCreate(userPayment);

    process.exit(0)
}

// seed data:
const seedProduct = [
    {
        "name": "Full Service",
        "rate": 150
    },
    {
        "name": "Chemicals Only",
        "rate": 75
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
        "email": "alivin@aol.com",
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
        "email": "john@aol.com",
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
        "email": "allison@msn.com",
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
        "email": "palba@gmail.com",
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
        "email": "dmorales@gmail.com",
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
        "email": "anderson@gmail.com",
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
        "email": "anderson@gmail.com",
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
        "email": "huhu@gmail.com",
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
        "email": "alejeune@gmail.com",
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
const seedService = [
    {
        "date": "2024-02-01",
        "employee_id": 1,
        "customer_id": 1
    },
    {
        "date": "2024-02-07",
        "employee_id": 1,
        "customer_id": 1
    },
    {
        "date": "2024-02-14",
        "employee_id": 1,
        "customer_id": 1
    },
    {
        "date": "2024-02-01",
        "employee_id": 1,
        "customer_id": 3
    },
    {
        "date": "2024-02-07",
        "employee_id": 1,
        "customer_id": 2
    },
    {
        "date": "2024-02-14",
        "employee_id": 2,
        "customer_id": 2
    },
    {
        "date": "2024-02-21",
        "employee_id": 2,
        "customer_id": 1
    },
    {
        "date": "2024-02-21",
        "employee_id": 2,
        "customer_id": 2
    },
    {
        "date": "2024-02-27",
        "employee_id": 2,
        "customer_id": 1
    },
    {
        "date": "2024-02-27",
        "employee_id": 2,
        "customer_id": 2
    }
]
const seedExpense = [
    {
        "date": "2024-02-01",
        "employee_id": 1,
        "customer_id": 1,
        "amount": 20.75,
        "description": "new filter"
    }
]
const seedInteraction = [
    {
        "date": "2024-02-01",
        "employee_id": 1,
        "customer_id": 1, 
        "note": "I told him he needs to trim his tree, or we'll have to charge him extra because it drops so many leaves. Let's remind him next month."
    }
]

seedDatabase();


