const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');
const { Sequelize, Op } = require('sequelize');
const { format_date, format_date_to_PST, get_today } = require('../../utils/helpers');

// for customer manager
router.get('/', withAdminAuth, async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [
        { model: Product },
        { model: Employee },
      ],
      where: {
        is_deleted: false
      },
      order: [['last_name', 'ASC']],
      raw: true
    });
    
    // fixing nested objects for handlebars
    const customersObj = customers.map(customer => ({
      ...customer,
      product: {
          id: customer['product.id'],
          name: customer['product.name'],
          rate: customer['product.rate']
      },
      employee: {
          id: customer['employee.id'],
          first_name: customer['employee.first_name'],
          last_name: customer['employee.last_name'],
      }
    })); 

    // manually add username
    for (customer of customersObj) {
      const user = await User.findAll({
        where: {
          customer_id: customer.id
        },
        raw: true
      });
      if (user.length) {
        customer.username = user[0].username
      }
      else {
        customer.username = ""
      }
    }

    res.render('admin/customers-manage', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin"),
      customersObj
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// view individual customer with records ledger
router.get('/view/:id', withAdminAuth, async (req, res) => {
  try {

    // get general customer data
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        { model: Product },
        { model: Employee }
      ],
      raw: true,
      nest: true
    });

    // manually add username
    const user = await User.findAll({
      where: {
        customer_id: customer.id
      },
      raw: true
    });
    if (user.length) {
      customer.username = user[0].username
    }
    else {
      customer.username = ""
    }

    // get customer record history
    let services = await Service.findAll({
      where: { customer_id: req.params.id },
      include: [{
        model: Product      
      }],
      raw: true
    });
    //convert product.rate to "amount" for flattening into other objects
    services = services.map(service => ({
      ...service,
      amount: service['product.rate'],
      type: 'Service'
    }));
    const expenses = await Expense.findAll({
      where: { customer_id: req.params.id },
      raw: true
    });
    const invoices = await Invoice.findAll({
      where: { customer_id: req.params.id },
      attributes: {
        include: [['id', 'invoice_id']], 
        exclude: ['content'],
      },
      raw: true
    });
    const payments = await Payment.findAll({
      where: { customer_id: req.params.id },
      raw: true
    });
    // combine records
    let allRecords = [];
    const addType = (array, type) => array.map(item => ({ ...item, type }));
    allRecords = allRecords.concat(
      addType(services, 'Service'),
      addType(expenses, 'Expense'),
      addType(invoices, 'Invoice'),
      addType(payments, 'Payment')
    );
    allRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    //get unpaidInvoiceBalance
    let unpaidInvoiceBalance = 0
    const unpaidInvoices = await Invoice.findAll({
      where: {
        customer_id: req.params.id,
        amount: {
            [Sequelize.Op.gt]: Sequelize.col('amount_paid')
        }
      },
      attributes: {
        exclude: ['content']
      },
      raw: true
    })
    if (unpaidInvoices.length) {
      for (let invoice of unpaidInvoices) {
        unpaidInvoiceBalance += parseFloat(invoice.amount)
        unpaidInvoiceBalance -= parseFloat(invoice.amount_paid)
      }
    }
    unpaidInvoiceBalance = unpaidInvoiceBalance.toFixed(2)

    // get amount of unbilled services and expenses
    let unbilledServiceData = await Service.findAll({
      where: { 
        customer_id: req.params.id,
        invoice_id: null 
      },
      include: [{
        model: Product      
      }],
      raw: true
    });
    unbilledServiceData = unbilledServiceData.map(service => ({
      ...service,
      amount: service['product.rate']
    }));
    let unbilledServices = 0
    for (let service of unbilledServiceData) {
      unbilledServices+= parseFloat(service.amount)
    }

    const unbilledExpenseData = await Expense.findAll({
      where: {
        customer_id: req.params.id,
        invoice_id: null
      },
      raw: true
    })
    let unbilledExpenses = 0
    for (let expense of unbilledExpenseData) {
      unbilledExpenses+= parseFloat(expense.amount)
    }
    let unbilledTotal = unbilledServices + unbilledExpenses
    unbilledTotal = unbilledTotal.toFixed(2)

    //render
    res.render('admin/customers-view', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin"),
      customer, allRecords, unpaidInvoiceBalance, unbilledTotal
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// for serving the create new customer page (GET)
router.get('/create', withAdminAuth, async (req, res) => {
  try {
    const products = await Product.findAll({raw: true});
    const employees = await Employee.findAll({raw: true});

    res.render('admin/customers-create', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin"),
      products, employees,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// for creating new customer (POST)
router.post('/create', withAdminAuth, async (req, res) => {
  try {
    const customerData = await Customer.create(req.body);
    res.status(200).json(customerData);
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// GET for updating existing customer
router.get('/edit/:id', withAdminAuth, async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [{ model: Product }, { model: Employee }],
      raw: true
    });
    const products = await Product.findAll({raw: true});
    const employees = await Employee.findAll({raw: true});

    res.render('admin/customers-edit', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin"),
      customer, products, employees,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// Update existing customer
router.put('/edit/:id', withAdminAuth, async (req, res) => {
  try {
    const customerData = await Customer.update(req.body, {
      where: { id: req.params.id }
    });
    res.status(200).json(customerData);
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// Delete customer
router.delete('/edit/:id', withAdminAuth, async (req, res) => {
  try {

    // update deleted status and de-associate with cleaner
    await Customer.update(
      { is_deleted: true, employee_id: null },
      { where: { id: req.params.id } }
    );

    res.status(200).json({ message: `success deleting id=${req.params.id}`});
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
})

// Employee Logging

// Log New Service (with customer id) (serving GET Page)
router.get('/new-service/:id', withAdminAuth, async (req, res) => {
  try {
    const customer_id = req.params.id
    const customer = await Customer.findByPk(customer_id, {
      include: [{ model: Product }, { model: Employee }],
      raw: true
    });
    const customers = await Customer.findAll({order: [['last_name', 'ASC']], raw: true});
    const employees = await Employee.findAll({order: [['last_name', 'ASC']], raw: true});
    const products = await Product.findAll({raw: true});
    const today = get_today()
    
    res.render('admin/log-service', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin"),
      customer, customers, employees, products, today
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// Log New Service (with customer id) (receiving POST)
router.post('/new-service/:id', withAdminAuth, async (req, res) => { 
  try {
    let {date, customer_id, employee_id, product_id} = req.body
    const status = await Service.create({
      date, customer_id,employee_id, product_id
    })
    // console.log(date) //saved as input-date 00:00:00

    //success; return to customers/view

    //rendering view (code copied from above)
    // get general customer data
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        { model: Product },
        { model: Employee }
      ],
      raw: true,
      nest: true
    });

    // manually add username
    const user = await User.findAll({
      where: {
        customer_id: customer.id
      },
      raw: true
    });
    if (user.length) {
      customer.username = user[0].username
    }
    else {
      customer.username = ""
    }

    // get customer record history
    let services = await Service.findAll({
      where: { customer_id: req.params.id },
      include: [{
        model: Product      
      }],
      raw: true
    });
    //convert product.rate to "amount" for flattening into other objects
    services = services.map(service => ({
      ...service,
      amount: service['product.rate'],
      type: 'Service'
    }));
    const expenses = await Expense.findAll({
      where: { customer_id: req.params.id },
      raw: true
    });
    const invoices = await Invoice.findAll({
      where: { customer_id: req.params.id },
      attributes: {
        include: [['id', 'invoice_id']], 
        exclude: ['content'],
      },
      raw: true
    });
    const payments = await Payment.findAll({
      where: { customer_id: req.params.id },
      raw: true
    });
    // combine records
    let allRecords = [];
    const addType = (array, type) => array.map(item => ({ ...item, type }));
    allRecords = allRecords.concat(
      addType(services, 'Service'),
      addType(expenses, 'Expense'),
      addType(invoices, 'Invoice'),
      addType(payments, 'Payment')
    );
    allRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    //get unpaidInvoiceBalance
    let unpaidInvoiceBalance = 0
    const unpaidInvoices = await Invoice.findAll({
      where: {
        customer_id: req.params.id,
        amount: {
            [Sequelize.Op.gt]: Sequelize.col('amount_paid')
        }
      },
      attributes: {
        exclude: ['content']
      },
      raw: true
    })
    if (unpaidInvoices.length) {
      for (let invoice of unpaidInvoices) {
        unpaidInvoiceBalance += parseFloat(invoice.amount)
        unpaidInvoiceBalance -= parseFloat(invoice.amount_paid)
      }
    }
    unpaidInvoiceBalance = unpaidInvoiceBalance.toFixed(2)

    // get amount of unbilled services and expenses
    let unbilledServiceData = await Service.findAll({
      where: { 
        customer_id: req.params.id,
        invoice_id: null 
      },
      include: [{
        model: Product      
      }],
      raw: true
    });
    unbilledServiceData = unbilledServiceData.map(service => ({
      ...service,
      amount: service['product.rate']
    }));
    let unbilledServices = 0
    for (let service of unbilledServiceData) {
      unbilledServices+= parseFloat(service.amount)
    }

    const unbilledExpenseData = await Expense.findAll({
      where: {
        customer_id: req.params.id,
        invoice_id: null
      },
      raw: true
    })
    let unbilledExpenses = 0
    for (let expense of unbilledExpenseData) {
      unbilledExpenses+= parseFloat(expense.amount)
    }
    let unbilledTotal = unbilledServices + unbilledExpenses
    unbilledTotal = unbilledTotal.toFixed(2)

    //render
    res.render('admin/customers-view', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin"),
      customer, allRecords, unpaidInvoiceBalance, unbilledTotal
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// Log New Expense (with customer id) (serving GET Page)
router.get('/new-expense/:id', withAdminAuth, async (req, res) => {
  try {
    const customer_id = req.params.id
    const customer = await Customer.findByPk(customer_id, {
      include: [{ model: Product }, { model: Employee }],
      raw: true
    });
    const customers = await Customer.findAll({order: [['last_name', 'ASC']], raw: true});
    const employees = await Employee.findAll({order: [['last_name', 'ASC']], raw: true});
    const today = get_today()
    
    res.render('admin/log-expense', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin" || req.session.access_level == "employee"),
      customer, customers, employees, today
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// Log New Expense (with customer id) (receiving POST)
router.post('/new-expense/:id', withAdminAuth, async (req, res) => {
  try {
    let {date, customer_id, employee_id, amount, description} = req.body
    //date = format_date(date)
    amount = amount.replace(/\$/g, '').replace(/,/g, '');
    const status = await Expense.create({
      date, customer_id, employee_id, amount, description
    })
    console.log(status)
    //success; return to customers/view

    //rendering view (code copied from above)
    // get general customer data
    const customer = await Customer.findByPk(req.params.id, {
      include: [
        { model: Product },
        { model: Employee }
      ],
      raw: true,
      nest: true
    });

    // manually add username
    const user = await User.findAll({
      where: {
        customer_id: customer.id
      },
      raw: true
    });
    if (user.length) {
      customer.username = user[0].username
    }
    else {
      customer.username = ""
    }

    // get customer record history
    let services = await Service.findAll({
      where: { customer_id: req.params.id },
      include: [{
        model: Product      
      }],
      raw: true
    });
    //convert product.rate to "amount" for flattening into other objects
    services = services.map(service => ({
      ...service,
      amount: service['product.rate'],
      type: 'Service'
    }));
    const expenses = await Expense.findAll({
      where: { customer_id: req.params.id },
      raw: true
    });
    const invoices = await Invoice.findAll({
      where: { customer_id: req.params.id },
      attributes: {
        include: [['id', 'invoice_id']], 
        exclude: ['content'],
      },
      raw: true
    });
    const payments = await Payment.findAll({
      where: { customer_id: req.params.id },
      raw: true
    });
    // combine records
    let allRecords = [];
    const addType = (array, type) => array.map(item => ({ ...item, type }));
    allRecords = allRecords.concat(
      addType(services, 'Service'),
      addType(expenses, 'Expense'),
      addType(invoices, 'Invoice'),
      addType(payments, 'Payment')
    );
    allRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    //get unpaidInvoiceBalance
    let unpaidInvoiceBalance = 0
    const unpaidInvoices = await Invoice.findAll({
      where: {
        customer_id: req.params.id,
        amount: {
            [Sequelize.Op.gt]: Sequelize.col('amount_paid')
        }
      },
      attributes: {
        exclude: ['content']
      },
      raw: true
    })
    if (unpaidInvoices.length) {
      for (let invoice of unpaidInvoices) {
        unpaidInvoiceBalance += parseFloat(invoice.amount)
        unpaidInvoiceBalance -= parseFloat(invoice.amount_paid)
      }
    }
    unpaidInvoiceBalance = unpaidInvoiceBalance.toFixed(2)

    // get amount of unbilled services and expenses
    let unbilledServiceData = await Service.findAll({
      where: { 
        customer_id: req.params.id,
        invoice_id: null 
      },
      include: [{
        model: Product      
      }],
      raw: true
    });
    unbilledServiceData = unbilledServiceData.map(service => ({
      ...service,
      amount: service['product.rate']
    }));
    let unbilledServices = 0
    for (let service of unbilledServiceData) {
      unbilledServices+= parseFloat(service.amount)
    }

    const unbilledExpenseData = await Expense.findAll({
      where: {
        customer_id: req.params.id,
        invoice_id: null
      },
      raw: true
    })
    let unbilledExpenses = 0
    for (let expense of unbilledExpenseData) {
      unbilledExpenses+= parseFloat(expense.amount)
    }
    let unbilledTotal = unbilledServices + unbilledExpenses
    unbilledTotal = unbilledTotal.toFixed(2)

    //render
    res.render('admin/customers-view', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin"),
      customer, allRecords, unpaidInvoiceBalance, unbilledTotal
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

module.exports = router;