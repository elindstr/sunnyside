const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');
const { format_date, get_today, calculateDaysBetweenDates } = require('../../utils/helpers');
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

router.get('/', withEmployeeAuth, async (req, res) => {
    try {
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
            
            let dayAlpha = dayToAlpha(i);   // get customers
            let customers = await Customer.findAll({
                where: {
                    schedule: dayAlpha,
                    employee_id: employee_id
                },
                raw: true
            });

            weekHeader.push(formatHeaderDate(day)) // format header

            weekSchedule.push({ // create customer list for each day
                dayStatus: timeStatus,
                customers: customers.map(customer => ({
                    id: customer.id,    // extra data for generating links / default inputs
                    employeeId: customer.employee_id,
                    name: `${customer.first_name} ${customer.last_name}`
                })),
            });
        }

        // render
        res.render('admin/calendar', {
            logged_in: req.session.logged_in,
            weekHeader, weekSchedule
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err});
    }
});       


module.exports = router;