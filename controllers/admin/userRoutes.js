const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');
const { Op } = require('sequelize');
var generator = require('generate-password');

// for user manager
router.get('/', withAdminAuth, async (req, res) => {
  try {
    const users = await User.findAll({
      raw: true
    });
    for (user of users) {
      if (user.access_level == 'customer') {
        const customer = await Customer.findByPk(user.customer_id)
        user.name = `${customer.first_name} ${customer.last_name}`
        user.email = customer.email
      }
      else {
        const employee = await Employee.findByPk(user.employee_id)
        user.name = `${employee.first_name} ${employee.last_name}`
        user.email = employee.email
      }
    }
    console.log(users)

    res.render('admin/users-manage', {
      logged_in: req.session.logged_in,
      users
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// for serving the create new user page (GET)
router.get('/create', withAdminAuth, async (req, res) => {
  try {
    const employees = await Employee.findAll({
      order: [['last_name', 'ASC']],
      raw: true
    });
    const customers = await Customer.findAll({
      order: [['last_name', 'ASC']],
      raw: true
    });
    res.render('admin/users-create', {
      logged_in: req.session.logged_in,
      employees, customers
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// for creating new user (POST)
router.post('/create', withAdminAuth, async (req, res) => {
  try {
    const newUserObject = req.body

    // check that username doesn't already exist
    var users = await User.findAll({
      where: {username: newUserObject.username},
      raw: true
    });
    if (users.length) {
      return res.status(400).json({message: "username already exists"});
    }

    // check that the employee/customer doesn't already have a user account
    if (newUserObject.customer_id)  {
      var users = await User.findAll({
        where: {customer_id: newUserObject.customer_id }
      })
      if (users.length) {
        console.log(users)
        return res.status(400).json({message: 'user already has an account'});
      }
    }
    if (newUserObject.employee_id)  {
      var users = await User.findAll({
        where: {employee_id: newUserObject.employee_id }
      })
      if (users.length) {
        console.log(users)
        return res.status(400).json({message: 'user already has an account'});
      }
    }

    // create
    const userData = await User.create(newUserObject);
    res.status(200).json(userData);

  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// GET for updating existing user
router.get('/edit/:id', withAdminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {raw: true});
    const employees = await Employee.findAll({
      order: [['last_name', 'ASC']],
      raw: true
    });
    const customers = await Customer.findAll({
      order: [['last_name', 'ASC']],
      raw: true
    });

    res.render('admin/users-edit', {
      logged_in: req.session.logged_in,
      user, employees, customers
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// Update existing user
router.put('/edit/:id', withAdminAuth, async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.params.id)
    const newUserObject = req.body

    // if changed, check that username doesn't already exist
    if (currentUser.username != newUserObject.username) {
      var users = await User.findAll({
        where: {
          username: newUserObject.username
        },
        raw: true
      });
      if (users.length) {
        return res.status(400).json({message: "username already exists"});
      }
    }

    // if employee/customer is changing, check that the new employee/customer doesn't already have a user account
    if ((currentUser.access_level != newUserObject.access_level) && (currentUser.customer_id != newUserObject.customer_id)) {
      if (newUserObject.customer_id)  {
        var users = await User.findAll({
          where: {
            customer_id: newUserObject.customer_id,
          }
        });
        if (users.length) {
          return res.status(400).json({message: 'Another user with this customer ID already has an account'});
        }
      }
    }  
    if ((currentUser.access_level != newUserObject.access_level) && (currentUser.employee_id != newUserObject.employee_id)) {
      if (newUserObject.employee_id)  {
        var users = await User.findAll({
          where: {
            employee_id: newUserObject.employee_id,
          }
        });
        if (users.length) {
          return res.status(400).json({message: 'Another user with this employee ID already has an account'});
        }
      }
    }
    
    // update
    const userData = await User.update(newUserObject, {
      where: { id: req.params.id}, 
      individualHooks: true
    });
    res.status(200).json(userData);

  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// Delete user
router.delete('/edit/:id', withAdminAuth, async (req, res) => {
  try {

    // // update to "is_deleted"
    // await User.update(
    //   { is_deleted: true },
    //   { where: { id: req.params.id } }
    // );
    await User.destroy(
      { where: { id: req.params.id } }
    );

    res.status(200).json({ message: `success deleting id=${req.params.id}`});
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
})

// generate user password
router.put('/password/:id', withAdminAuth, async (req, res) => {
  try {

    const newPassword = generator.generate({
      length: 8,
      numbers: true,
      excludeSimilarCharacters: true
    });

    res.status(200).json({ password: newPassword});

  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
})


module.exports = router;