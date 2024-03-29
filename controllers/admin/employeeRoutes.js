const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');

// for employee manager
router.get('/', withAdminAuth, async (req, res) => {
  try {
    const employees = await Employee.findAll({
      where: {
        is_deleted: false
      },
      raw: true
    });
    res.render('admin/employees-manage', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin"),
      employees
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// for serving the create new employee page (GET)
router.get('/create', withAdminAuth, async (req, res) => {
  try {
    res.render('admin/employees-create', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin"),
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// for creating new employee (POST)
router.post('/create', withAdminAuth, async (req, res) => {
  try {
    const employeeData = await Employee.create(req.body);
    res.status(200).json(employeeData);
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// GET for updating existing employee
router.get('/edit/:id', withAdminAuth, async (req, res) => {
  try {
    const employeeData = await Employee.findByPk(req.params.id, {
    });
    const employee = employeeData.get({ plain: true })

    res.render('admin/employees-edit', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin"),
      employee,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// Update existing employee
router.put('/edit/:id', withAdminAuth, async (req, res) => {
  try {
    console.log(`received request to update ${req.params.id}`)
    const employeeData = await Employee.update(req.body, {
      where: { id: req.params.id }
    });
    res.status(200).json(employeeData);
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// Delete employee
router.delete('/edit/:id', withAdminAuth, async (req, res) => {
  try {

    // update to "is_deleted"
    await Employee.update(
      { is_deleted: true },
      { where: { id: req.params.id } }
    );

    // de-associate customers
    await Customer.update(
      { employee_id: null },
      { where: { employee_id: req.params.id } }
    );

    res.status(200).json({ message: `success deleting id=${req.params.id}`});
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
})

module.exports = router;