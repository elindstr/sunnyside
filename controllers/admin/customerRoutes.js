const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');

// for customer manager
router.get('/', withAdminAuth, async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [
        { model: Product },
        { model: Employee }
      ],
      where: {
        is_deleted: false
      },
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

    res.render('admin/customers-manage', {
      logged_in: req.session.logged_in,
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
      raw: true
    });

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

    //render
    res.render('admin/customers-view', {
      logged_in: req.session.logged_in,
      customer, allRecords
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
    console.log(`received request to update ${req.params.id}`)
    console.log(req.body)
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

module.exports = router;