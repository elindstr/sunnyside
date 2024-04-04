const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../utils/auth');
const { format_date, format_date_to_PST, get_today, calculateDaysBetweenDates } = require('../utils/helpers');
const { Sequelize, Op } = require('sequelize');

function dayToAlpha(dayNum) {
  const days = { 1: 'M', 2: 'T', 3: 'W', 4: 'R', 5: 'F' };
  return days[dayNum] || null;
}
function formatHeaderDate(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeek = days[date.getDay()];
  const month = date.getMonth() + 1
  const day = date.getDate();
  return `${dayOfWeek} (${month}/${day})`;
}

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
      logged_in_as_admin: (req.session.access_level == "admin"),
      logged_in_as_employee: (req.session.access_level == "employee"),
      logged_in_as_customer: (req.session.access_level == "customer"),
      userData
    });  
  }
  else if (req.session.access_level == "employee") {
    userData = await Employee.findByPk(req.session.employee_id);
    userData = userData.get({ plain: true })

    try {
      const employee_id = req.session.employee_id  
      const today = new Date();
      const dayOfWeek = today.getDay(); // Sunday = 0
      
    res.render('employee/homepage', {
      logged_in: req.session.logged_in,
      logged_in_as_employee: (req.session.access_level == "employee"), userData
    });
    } catch (err) {
      console.log(err)
      res.status(500).json({message: err});
    } 
  }
  
  else if (req.session.access_level == "customer") {
    userData = await Customer.findByPk(req.session.customer_id);
    userData = userData.get({ plain: true })
    res.render('customer/homepage', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin"),
      logged_in_as_employee: (req.session.access_level == "employee"),
      logged_in_as_customer: (req.session.access_level == "customer"),
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
