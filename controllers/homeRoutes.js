const router = require('express').Router();
const { Employee, Customer } = require('../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../utils/auth');

router.get('/', async (req, res) => {
  res.render('home', {
    logged_in: req.session.logged_in,
  })
})

router.get('/dashboard', withAuth, async (req, res) => {
  let userData

  if (req.session.access_level == "admin") {
    userData = await Employee.findByPk(req.session.employee_id);
    userData = userData.get({ plain: true })
    res.render('admin/homepage', {
      logged_in: req.session.logged_in,
      userData
    });  
  }
  else if (req.session.access_level == "employee") {
    userData = await Employee.findByPk(req.session.employee_id);
    userData = userData.get({ plain: true })
    res.render('employee/homepage', {
      logged_in: req.session.logged_in,
      userData
    });  
  }
  else if (req.session.access_level == "customer") {
    userData = await Customer.findByPk(req.session.customer_id);
    userData = userData.get({ plain: true })
    res.render('customer/homepage', {
      logged_in: req.session.logged_in,
      userData
    });  
  }
})

router.get('/login', (req, res) => {
  if (req.session.logged_in) {
    const redirectTo = req.session.redirectTo 
    if (redirectTo) {
      res.redirect(redirectTo);
    }
    else {
      res.redirect('/dashboard');
    }
  }
  else {
    res.render('login');
  }
});

router.get('/logout', (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.redirect("/");
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
