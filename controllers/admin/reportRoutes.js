const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');
const { format_date, get_today, calculateDaysBetweenDates } = require('../../utils/helpers');
const { Sequelize, Op } = require('sequelize');

// age receivables report
router.get('/ar', withAdminAuth, async (req, res) => {
    try {
        const today = get_today()

        // get unpaid invoices by oldest date
        const invoiceObj = await Invoice.findAll({
            include: [
                { model: Customer },
            ],
            where: {
                amount: {
                    [Sequelize.Op.gt]: Sequelize.col('amount_paid')
                },
            },
            raw: true
        });
        const customerList = await Customer.findAll({
            attributes: {
                include: ['id', 'first_name', 'last_name']
            },
            raw: true
        })

        // construct arObj of customer and their ARs for each daysToCheck
        const arObj = {};
        customerList.forEach(customer => {
            let ar0 = 0, ar30 = 0, ar60 = 0, ar90 = 0;
            invoiceObj.forEach(invoice => {
                if (invoice.customer_id === customer.id) {
                    let amount_unpaid = parseFloat(invoice.amount) - parseFloat(invoice.amount_paid);

                    let daysOld = calculateDaysBetweenDates(invoice.date, today);

                    //console.log(invoiceObj, amount_unpaid, daysOld)

                    if (daysOld > 90) ar90 += amount_unpaid;
                    else if (daysOld > 60) ar60 += amount_unpaid;
                    else if (daysOld > 30) ar30 += amount_unpaid;
                    else if (daysOld >= 0) ar0 += amount_unpaid;
                }
            });
            arObj[customer.id] = { 
                id: customer.id, 
                first_name: customer.first_name, 
                last_name: customer.last_name, 
                ar0: ar0.toFixed(2), 
                ar30: ar30.toFixed(2), 
                ar60: ar60.toFixed(2), 
                ar90: ar90.toFixed(2), 
                arTotal: (ar0 + ar30 + ar60 + ar90).toFixed(2) 
            };
        });

        // get AR totals
        let ar0Total = 0
        let ar30Total = 0
        let ar60Total = 0
        let ar90Total = 0
        for (let invoice of invoiceObj) {
            let amount_unpaid = parseFloat(invoice.amount) - parseFloat(invoice.amount_paid)
            let daysOld = calculateDaysBetweenDates(invoice.date, today)
            if (daysOld > 90) {ar90Total+= amount_unpaid}
            else if (daysOld > 60) {ar60Total+= amount_unpaid}
            else if (daysOld > 30) {ar30Total+= amount_unpaid}
            else if (daysOld > 0) {ar0Total+= amount_unpaid}
        }
        const arTotal = (ar0Total + ar30Total + ar60Total + ar90Total).toFixed(2)
        ar0Total = ar0Total.toFixed(2)
        ar30Total = ar30Total.toFixed(2)
        ar60Total = ar60Total.toFixed(2)
        ar90Total = ar90Total.toFixed(2)
        
        
        //console.log(arObj)
        // render
        res.render('admin/reports-ar', {
            logged_in: req.session.logged_in,
            logged_in_as_admin: (req.session.access_level == "admin"),
            arObj, ar0Total, ar30Total, ar60Total, ar90Total, arTotal
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({message: err});
    }
});       


module.exports = router;