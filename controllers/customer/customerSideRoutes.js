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
      console.log(err);
      res.status(500).json({message: err});
    }
});

router.get('/view/invoice/:id', withCustomerAuth, async (req, res) => {
  try {
    const invoiceData = await Invoice.findByPk(req.params.id);
    res.send(invoiceData.content);
  } catch (err) {
    console.log(err);
    res.status(500).json({message: err});
  }
});

router.get('/payments', withCustomerAuth, async (req, res) => {
  try {
    const customer = req.session.customer_id
    const payments = await Payment.findAll({
      where: {customer_id: customer},
      raw: true,
    });

    payments.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.render('customer/payments', {
      logged_in: req.session.logged_in,
      payments
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({message: err});
  }
});

router.get('/view/payment/:id', withCustomerAuth, async (req, res) => {
  try {
    const bills = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          attributes: ['first_name', 'last_name', 'address', 'email'],
        },
      ],
    });
    const bill = bills.get({plain: true});
    console.log(bill);
    res.render('customer/bill', {
      logged_in: req.session.logged_in,
      bill
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: err});
  }
});

module.exports = router;