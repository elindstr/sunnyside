const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');


router.get('/invoices', withCustomerAuth, async (req, res) => {
    try {
  
      // get general customer data
      const customer = req.session.customer_id

      // get customer record history
      let services = await Service.findAll({
        where: { customer_id: customer },
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
        where: { customer_id: customer },
        raw: true
      });
      const invoices = await Invoice.findAll({
        where: { customer_id: customer },
        attributes: {
          include: [['id', 'invoice_id']], 
          exclude: ['content'],
        },
        raw: true
      });
      const payments = await Payment.findAll({
        where: { customer_id: customer },
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

      //render
      res.render('customer/invoices', {
        logged_in: req.session.logged_in,
        allRecords,
        customer
      })
    } catch (err) {
      console.log(err)
      res.status(500).json({message: err});
    }
});

router.get('/view/:id', withCustomerAuth, async (req, res) => {
  try {
    const invoiceData = await Invoice.findByPk(req.params.id)
    res.send(invoiceData.content)
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

module.exports = router;