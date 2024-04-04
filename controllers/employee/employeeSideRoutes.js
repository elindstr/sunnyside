const router = require('express').Router();// Path: controllers/employee/employeeSideRoutes.js
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');
const { Sequelize, Op } = require('sequelize');
const { format_date, format_date_to_PST, get_today, calculateDaysBetweenDates } = require('../../utils/helpers');


// Work Schedule
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
router.get('/calendar', withEmployeeAuth, async (req, res) => {
    try {
        userData = await Employee.findByPk(req.session.employee_id);
        userData = userData.get({ plain: true })
        const employee_id = req.session.employee_id  
        const today = new Date();
        const dayOfWeek = today.getDay(); // Sunday = 0
        
        // get the date of Monday (the start of the calendar)
        const monDate = new Date(today);
        if (dayOfWeek === 0) {
            monDate.setDate(today.getDate() + 1)
        }
        else if (dayOfWeek === 6) {
            monDate.setDate(today.getDate() + 2);
        } else {
            monDate.setDate(today.getDate() - dayOfWeek + 1);
        }

        let weekHeader = [] // for the names of the week in the table header
        let weekSchedule = [] // for the names on each day
        for (let i = 1; i <= 5; i++) { // Mon (1) through Fri (5)

            let day = new Date(monDate) // get actual date for color coding
            day.setDate(monDate.getDate() + i - 1)
            let timeStatus
            if (day < today) {
                timeStatus = 'past';
            } else if (day.getTime() === today.getTime()) {
                timeStatus = 'today';
            } else {
                timeStatus = 'future';
            }

            weekHeader.push(formatHeaderDate(day)) // format header
            
            // get customers and include where they've had services on that day
            let dayAlpha = dayToAlpha(i);
            const dayStart = format_date(day);
            const dayEnd = format_date(day);
            let adjustedDayStart = new Date(dayStart);  //adjusting sequelize's difficult search query conversion to UTC
            let adjustedDayEnd = new Date(dayEnd);
            adjustedDayStart.setHours(adjustedDayStart.getHours() - 7);
            adjustedDayEnd.setHours(adjustedDayEnd.getHours() - 7);
            const adjustedStartStr = adjustedDayStart.toISOString().replace('T', ' ').substring(0, 19);
            const adjustedEndStr = adjustedDayEnd.toISOString().replace('T', ' ').substring(0, 19);


            console.log(dayStart, dayEnd)
            const customers = await Customer.findAll({
                include: [{
                    model: Service,
                    where: {
                        date: {
                            [Op.gte]: adjustedStartStr,
                            [Op.lte]: adjustedEndStr
                            }
                    },
                    required: false
                }],
                where: {
                    schedule: dayAlpha,
                    employee_id: employee_id
                },
                raw: true,
                nest: true
            });
            console.log(format_date(day))
            console.log(customers)

            weekSchedule.push({ // construct customer list for this day
                dayStatus: timeStatus,
                customers: customers.map(customer => ({
                    id: customer.id,
                    employee_id: customer.employee_id,
                    name: `${customer.first_name} ${customer.last_name}`,
                    isServiced: customer.services.id
                })),
            });
        }
        //console.log(weekSchedule[1])

        const employees = await Employee.findAll({raw: true}) 

        res.render('employee/calendar', {
        logged_in: req.session.logged_in,
        logged_in_as_admin: (req.session.access_level == "admin"),
        logged_in_as_employee: (req.session.access_level == "employee"),
        logged_in_as_customer: (req.session.access_level == "customer"),
        userData,weekHeader, weekSchedule, employees
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err});
    } 
})


// Route for employee info
router.get('/employee-info', withEmployeeAuth, async (req, res) => {
    try {
        const employee_id = req.session.employee_id
        const employee = await Employee.findByPk(employee_id, {raw: true})
        console.log(employee) 
        res.render('employee/employee-info', {
            logged_in: req.session.logged_in,
            logged_in_as_employee: (req.session.access_level == "employee"), employee
        })
     } catch (err) {
        console.log(err)
        res.status(500).json({message: err});
    }
});

//route for employee update password
router.get ('/update', withEmployeeAuth, async (req, res) => {
    console.log ("test")
    try {
        res.render('employee/employee-update-password', {
            logged_in: req.session.logged_in,
            logged_in_as_employee: (req.session.access_level == "employee"),
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err});
    }
});

// post route to update employee password
router.post ('/new-password', withEmployeeAuth, async (req, res) => {
    
    try {
        const employee_id = req.session.employee_id
        const {newPassword} = req.body
        console.log(employee_id, newPassword)

        const userObj = await User.findOne({
            where: {employee_id: employee_id}
        });
        console.log(userObj)
        userObj.password = newPassword;
        await userObj.save(); // trigger beforeUpdate hook

        res.status(200).json({message: "success"});
        // todo: redirect back to homepage 

    } catch (err) {
        console.log(err)
        res.status(500).json({message: err});
    }
});




    //route for employee log new expense

    router.get ('/log-new-expense', withEmployeeAuth, async (req, res) => {
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

    //route for employee log new note

    router.get ('/log-new-note', withEmployeeAuth, async (req, res) => {
        console.log ("test")
        try {
            res.render('employee/employee-log-new-note', {
                logged_in: req.session.logged_in,
                logged_in_as_employee: (req.session.access_level == "employee"),
            })
        } catch (err) {
            console.log(err)
            res.status(500).json({message: err});
        }
    });




    module.exports = router;


