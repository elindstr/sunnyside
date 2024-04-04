const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');
const { format_date, format_date_to_PST, get_today, calculateDaysBetweenDates } = require('../../utils/helpers');
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

        // render
        res.render('/', {
            logged_in: req.session.logged_in,
            logged_in_as_employee: (req.session.access_level == "employee"),
            weekHeader, weekSchedule, employees
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err});
    }
});


module.exports = router;