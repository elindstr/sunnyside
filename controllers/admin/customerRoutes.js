const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');

// for customer manager
router.get('/', withAdminAuth, async (req, res) => {
  try {
    const customerData = await Customer.findAll({
      include: [{ model: Product }, { model: Employee }],
    });
    const customers = customerData.map((customer) => customer.get({ plain: true }));
    res.render('admin/customers-manage', {
      logged_in: req.session.logged_in,
      customers
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// for serving the create new customer page (GET)
router.get('/create', withAdminAuth, async (req, res) => {
  try {
    const productData = await Product.findAll();
    const products = productData.map((product) => product.get({ plain: true }));

    const employeeData = await Employee.findAll();
    const employees = employeeData.map((employee) => employee.get({ plain: true }));

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
    const customerData = await Customer.findByPk(req.params.id, {
      include: [{ model: Product }, { model: Employee }],
    });
    const customer = customerData.get({ plain: true })

    const productData = await Product.findAll();
    const products = productData.map((product) => product.get({ plain: true }));

    const employeeData = await Employee.findAll();
    const employees = employeeData.map((employee) => employee.get({ plain: true }));

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
    await Customer.destroy({
      where: { id: req.params.id }
    });
    res.status(200).json({ message: `success deleting id=${req.params.id}`});
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
})

module.exports = router;