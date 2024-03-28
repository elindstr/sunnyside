const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');


router.get('/invoices', withCustomerAuth, async (req, res) => {
    try {
  
      // get general customer data
      const customer = req.session.customer_id;

      const invoices = await Invoice.findAll({
        where: { customer_id: customer },
        attributes: {
          include: [['id', 'invoice_id']], 
          exclude: ['content'],
        },
        raw: true
      });

      // combine records
      let allRecords = [];
      const addType = (array, type) => array.map(item => ({ ...item, type }));
      allRecords = allRecords.concat(
        addType(invoices, 'Invoice'),
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