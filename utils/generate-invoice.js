// called by seeds and admin to create a new invoice

const { Batch, Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../models');
const { Sequelize, Op } = require('sequelize');
const { format_date, format_date_to_PST, get_today } = require('../utils/helpers');
const { sendEmail } = require('./email');
const { getPaymentUrl } = require('./stripe');

const batchGenerate = async (date, start_date, end_date) => {
    // update batch table
    await Batch.create({
        date: end_date,
        end_date: end_date
    })
    
    // get all customer ids
    const customerIDs = await Customer.findAll({
        attributes: ['id'],
        raw: true
    })
    // iteratively call generate 
    for (idObj of customerIDs) {
        await generate(idObj.id, date, start_date, end_date)
    }
}

const generate = async (customer_id, date, start_date, end_date, type) => {
    // get general customer data 
    const customerData = await Customer.findByPk(customer_id, {raw: true}) 

    // get services and expenses for customer with null invoice_id in date range
    const serviceData = await Service.findAll({
    where: {
        customer_id: customer_id, 
        invoice_id: null,
        date: {
        [Sequelize.Op.gte]: start_date,
        [Sequelize.Op.lte]: end_date
        }
        
    },
    include: [{
        model: Product      
    }],
    raw: true
    })
    const expenseData = await Expense.findAll({
    where: {
        customer_id: customer_id, 
        invoice_id: null,
        date: {
        [Sequelize.Op.gte]: start_date,
        [Sequelize.Op.lte]: end_date
        }
    },
    raw: true
    })

    // calculate amounts
    const serviceAmount = serviceData.reduce((total, item) => total + parseFloat(item['product.rate']), 0);
    const expenseAmount = expenseData.reduce((total, item) => total + parseFloat(item.amount), 0);
    const totalAmount = (serviceAmount + expenseAmount)

    // early return on no content
    if (serviceData.length == 0 && expenseData.length == 0) {
        //throw new Error('Invoice has no data');
        return 'none'
    }

    // create new invoice
    const newInvoiceObject = {
    customer_id,
    date,
    start_date,
    end_date,
    amount: totalAmount || 0,
    };
    const invoiceData = await Invoice.create(newInvoiceObject);

    // create invoice content
    const content = `
    <html><head><style>
        .invoice-container {
            font-family: 'Arial', sans-serif;
            max-width: 800px;
            margin: auto;
            padding: 20px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
        }
        .invoice-header {
            text-align: center;
            margin-bottom: 40px;
        }
        .invoice-header h1 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }
        .invoice-body {
            margin-bottom: 20px;
        }
        .line-items {
            width: 100%;
            border-collapse: collapse;
        }
        .line-items thead th {
            background-color: #f5f5f5;
            color: #333;
            padding: 10px;
            text-align: left;
        }
        .line-items tbody td {
            border-bottom: 1px solid #eee;
            padding: 10px;
        }
        .invoice-footer {
            text-align: right;
            font-size: 18px;
            margin-top: 20px;
        }
        </style></head>
        <body>
        <div class='invoice-container'>
            <div class='invoice-header'>
                <img src='https://sunnyside-699326087e54.herokuapp.com/assets/logo.png' width='200px' alt='Sunnyside Pools'><br>
                Invoice No. ${invoiceData.id}<br>
                Date: ${date}
            </div>
            
            <div class='invoice-body'>
                <strong>Billed To:</strong><br>
                ${customerData.first_name} ${customerData.last_name}<br>
                ${customerData.address}<br>
                ${customerData.email}<br>
            </div>

            <div>
                <strong>For services through:</strong> ${end_date}<br><br>
            </div>

            <table class='line-items'>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td colspan="3"><strong>Services:</strong></td></tr>
                    ${serviceData.map(service => `<tr><td>${format_date_to_PST(service.date)}</td><td>${service['product.name']}</td><td>$${service['product.rate']}</td></tr>`).join('')}
                    ${expenseAmount ? `<tr><td colspan="3"><strong>Expenses:</strong></td></tr>${expenseData.map(expense => `<tr><td>${format_date_to_PST(expense.date)}</td><td>${expense.description}</td><td>$${expense.amount}</td></tr>`).join('')}` : ''}
                </tbody>
            </table>

            
            <div class='invoice-footer'>
                <strong>Amount Due:</strong> $${totalAmount}
            </div>
        </div>
    </body></html>`
    const invoice = await Invoice.update({ content }, { where: { id: invoiceData.id } });
    // console.log("invoice:")
    // console.log(invoice)

    // assign services and expenses to new invoice 
    serviceData.forEach(async (service) => {
        await Service.update(
            { invoice_id: invoiceData.id },
            { where: { id: service.id } }
        )
    })
    expenseData.forEach(async (expense) => {
        await Expense.update(
            { invoice_id: invoiceData.id },
            { where: { id: expense.id } }
        )
    })

    // get Stripe payment url
    const stripe_payment_url = await getPaymentUrl(newInvoiceObject, customerData, invoiceData.id)

    if (type != "seed") {  // skip on seeding to prevent gmail limits
        
        // notify customer of new invoice
        if (customerData.email) {
            const emailObject = {
                from: 'Sunnyside Pools <sunnyside.sacramento@gmail.com>',
                to: customerData.email,
                subject: 'Sunnyside Invoice',
                text: `Hi ${customerData.first_name}! You have a new invoice. You may login to your online dashboard <https://sunnyside-699326087e54.herokuapp.com/> to view it.\n
                
                We accept online payments here: ${stripe_payment_url}.\n\n

                Sunnyside Pools`,
                html: `<p>Hi ${customerData.first_name}!</p> 
                
                <p>You have a new invoice from Sunnyside Pools. Please login to your <a href="https://sunnyside-699326087e54.herokuapp.com/">online dashboard</a> to view it.</p>

                <p>We accept online payments <a href='${stripe_payment_url}'>here</a>.</p>

                <img src='https://sunnyside-699326087e54.herokuapp.com/assets/logo.png' width='190px' alt='Sunnyside Pools'>
                `
            }
            await sendEmail(emailObject)
        }
    }

    // done
    return
}

module.exports = {generate, batchGenerate};
