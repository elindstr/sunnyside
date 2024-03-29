const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');


// view all records
router.get('/', withAdminAuth, async (req, res) => {
    try {
  
      // get customer record history
      let services = await Service.findAll({
        include: [{
          model: Product      
        }],
        raw: true
      });
      //convert product.rate to "amount" for flattening into other objects
      services = services.map(service => ({
        ...service,
        amount: service['product.rate'],
        type: 'Service'
      }));
      const expenses = await Expense.findAll({
        raw: true
      });
      const invoices = await Invoice.findAll({
        attributes: {
          include: [['id', 'invoice_id']], 
          exclude: ['content'],
        },
        raw: true
      });
      const payments = await Payment.findAll({
        raw: true
      });
      // combine records
      let allRecords = [];
      const addType = (array, type) => array.map(item => ({ ...item, type }));
      allRecords = allRecords.concat(
        addType(services, 'Service'),
        addType(expenses, 'Expense'),
        addType(invoices, 'Invoice'),
        addType(payments, 'Payment')
      );
      allRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
      console.log(allRecords)
  
      //render
      res.render('admin/records', {
        logged_in: req.session.logged_in,
        logged_in_as_admin: (req.session.access_level == "admin"),
        allRecords
      })
    } catch (err) {
      console.log(err)
      res.status(500).json({message: err});
    }
  });

  module.exports = router;