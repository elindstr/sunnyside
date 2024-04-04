const router = require('express').Router();// Path: controllers/employee/employeeSideRoutes.js
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');
const Sequelize = require('sequelize');

// Route for employee info
router.get('/employee-info', withEmployeeAuth, async (req, res) => {
    try {
        res.render('employee/employee-info', {
            logged_in: req.session.logged_in,
            logged_in_as_employee: (req.session.access_level == "employee"),
        })
     } catch (err) {
            console.log(err)
            res.status(500).json({message: err});
        }
    });

    //route for employee log new expense

    router.get ('/log-new-expense', withEmployeeAuth, async (req, res) => {
        console.log ("test")
        try {
            res.render('employee/employee-log-new-expense', {
                logged_in: req.session.logged_in,
                logged_in_as_employee: (req.session.access_level == "employee"),
            })
        } catch (err) {
            console.log(err)
            res.status(500).json({message: err});
        }
    });

    //route for employee log new service

    router.get ('/log-new-service', withEmployeeAuth, async (req, res) => {
        try {
            res.render('employee/employee-log-new-service', {
                logged_in: req.session.logged_in,
                logged_in_as_employee: (req.session.access_level == "employee"),
            })
        } catch (err) {
            console.log(err)
            res.status(500).json({message: err});
        }
    });







    module.exports = router;


