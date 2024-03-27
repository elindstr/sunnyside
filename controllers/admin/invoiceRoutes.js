const router = require('express').Router();
const { Batch, Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');
const { format_date, get_today } = require('../../utils/helpers');
const {batchGenerate, generate} = require('../../utils/generate-invoice.js');
const { Sequelize, Op } = require('sequelize');

// invoice manager
router.get('/', withAdminAuth, async (req, res) => {
  try {
    
    // get date of last batch run
    const lastBatchRunData = await Batch.findAll({
      order: [['date', 'DESC']],
      limit: 1,
      raw: true
    });
    let lastBatchRun = ""
    if (lastBatchRunData.length) {
      lastBatchRun = format_date(lastBatchRunData[0].date)
    }

    // get IDs of services with null invoice_id
    const uninvoicedServiceIDs = await Service.findAll({
      where: { invoice_id: null },
      attributes: ['customer_id'],
      group: ['customer_id'],
    });
    // get IDs of expenses with null invoice_id
    const uninvoicedExpenseIDs = await Expense.findAll({
      where: { invoice_id: null },
      attributes: ['customer_id'],
      group: ['customer_id'],
    });
    // aggregate ids
    const customerIDsFromServices = uninvoicedServiceIDs.map(service => service.customer_id);
    const customerIDsFromExpenses = uninvoicedExpenseIDs.map(expense => expense.customer_id);
    // remove duplicate ids
    const combinedCustomerIDs = [...customerIDsFromServices, ...customerIDsFromExpenses];
    const uniqueCustomerIDs = [];
    for (let id of combinedCustomerIDs) {
      if (!uniqueCustomerIDs.includes(id)) {
        uniqueCustomerIDs.push(id);
      }
    }
    // query Customers of selected ids
    const customers = await Customer.findAll({
      where: {
        id: uniqueCustomerIDs,
        is_deleted: false
      },
      include: [
        { model: Product },
        { model: Employee },
      ],
      raw: true
    });
    const customersCount = customers.length    

    // get list of invoices
    const invoices = await Invoice.findAll({
      include: [
        { model: Customer }
      ],
      raw: true
    })

    const today = get_today()

    //render
    res.render('admin/invoices', {
      logged_in: req.session.logged_in,
      customers, customersCount, invoices, today, lastBatchRun
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// // preview invoice
// router.get('/preview/:id', withAdminAuth, async (req, res) => {
//   try {

//     // get uninvoiced services or expenses
//     const customerData = await Customer.findByPk(req.params.id, {
//       include: [
//         {
//           model: Service,
//           where: { invoice_id: null },
//           required: false,
//           include: [{model: Employee}, {model: Product}]
//         },
//         {
//           model: Expense,
//           where: { invoice_id: null },
//           required: false,
//           include: [{model: Employee}]
//         },
//         {model: Product},
//         {model: Employee}
//       ]
//     });
//     const customer = customerData.get({ plain: true })

//     // calculate amounts
//     const serviceAmounts = customer.services || [];
//     const areServices = serviceAmounts.length > 0;
//     let serviceAmount = serviceAmounts.reduce((total, service) => {
//       return total + parseFloat(service.product.rate);
//     }, 0);
//     serviceAmount = parseFloat(serviceAmount).toFixed(2);

//     const expenseAmounts = customer.expenses || [];
//     const areExpenses = expenseAmounts.length > 0;
//     let expenseAmount = expenseAmounts.reduce((total, expense) => {
//       return total + parseFloat(expense.amount);
//     }, 0);
//     expenseAmount = parseFloat(expenseAmount).toFixed(2);
    
//     let totalAmount = serviceAmount + expenseAmount;
//     totalAmount = parseFloat(totalAmount).toFixed(2);

//     // dates
//     const date = get_today()

//     res.render('admin/invoices-preview', {
//       layout: false,
//       logged_in: req.session.logged_in,
//       customer, 
//       serviceAmount, areServices, expenseAmount, areExpenses,
//       totalAmount, today
//     })

//   } catch (err) {
//     console.log(err)
//     res.status(500).json({message: err});
//   }
// });

// view invoice by id
router.get('/view/:id', withAdminAuth, async (req, res) => {
  try {
    const invoiceData = await Invoice.findByPk(req.params.id)
    res.send(invoiceData.content)
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});


// generate single invoice
router.post('/generate', withAdminAuth, async (req, res) => {
  try {
    const {customer_id, date, start_date, end_date} = req.body
    const msg = await generate(customer_id, date, start_date, end_date);
    if (msg == "none") {
      return res.status(400).json({ message: 'no data' });
    } 
    res.status(200).json({ message: 'Invoice generated successfully.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// generate invoices for all accounts
router.post('/generate-batch', withAdminAuth, async (req, res) => {
  try {
    const {date, start_date, end_date} = req.body
    const msg = await batchGenerate(date, start_date, end_date);
    if (msg == "none") {
      return res.status(400).json({ message: 'no data' });
    } 
    res.status(200).json({ message: 'Invoices generated successfully.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET for updating existing invoice
router.get('/edit/:id', withAdminAuth, async (req, res) => {
  try {
    const invoiceData = await Invoice.findByPk(req.params.id, {
    });
    const invoice = invoiceData.get({ plain: true })
    res.render('admin/invoices-edit', {
      logged_in: req.session.logged_in,
      invoice,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// Update existing invoice
router.put('/edit/:id', withAdminAuth, async (req, res) => {
  try {
    console.log(`received request to update ${req.params.id}`)
    const invoiceData = await Invoice.update(req.body, {
      where: { id: req.params.id }
    });
    res.status(200).json(invoiceData);
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// Delete invoice
router.delete('/edit/:id', withAdminAuth, async (req, res) => {
  try {

    // todo: this is dangerous. better to update isDeleted status; and de-associate keys (un-invoice services and expenses and payments)
    await Invoice.destroy({
      where: { id: req.params.id }
    });
    res.status(200).json({ message: `success deleting id=${req.params.id}`});
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
})

module.exports = router;