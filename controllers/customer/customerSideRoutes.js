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

      invoices.sort((a, b) => new Date(a.date) - new Date(b.date));

      //render
      res.render('customer/invoices', {
        logged_in: req.session.logged_in,
        invoices,
        customer
      })
    } catch (err) {
      console.log(err);
      res.status(500).json({message: err});
    }
});

router.get('/view/invoice/:id', withCustomerAuth, async (req, res) => {
  try {
    const billData = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          attributes: ['first_name', 'last_name', 'address', 'email'],
        },
      ],
    });

    const bill = billData.get({ plain: true });

    bill.hasOutstandingAmount = bill.amount - bill.amount_paid > 0;

    res.render('customer/pay-bill', {
      logged_in: req.session.logged_in,
      bill,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: err});
  }
});

router.get('/payments', withCustomerAuth, async (req, res) => {
  try {
    const customer = req.session.customer_id
    const payments = await Payment.findAll({
      include: [
        {
          model: Invoice,
          where: {customer_id: customer},
        },
      ],
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
    const billData = await Payment.findByPk(req.params.id, {
      include: [
        {
          model: Customer,
          attributes: ['first_name', 'last_name', 'address', 'email'],
        },
        {
          model: Invoice,
          attributes: ['stripe_payment_url', 'amount', 'amount_paid'],
        },
      ],
    });
    const bill = billData.get({plain: true});

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