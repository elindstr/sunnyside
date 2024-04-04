const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');


router.get('/invoices', withCustomerAuth, async (req, res) => {
    try {
  
      // get the customer id from the session
      const customer = req.session.customer_id;

      const invoices = await Invoice.findAll({
        where: { customer_id: customer },
        attributes: {
          include: [['id', 'invoice_id']], 
          exclude: ['content'],
        },
        raw: true
      });

      // sort the invoices by date
      invoices.sort((a, b) => new Date(a.date) - new Date(b.date));

      //render
      res.render('customer/invoices', {
        logged_in: req.session.logged_in,
        logged_in_as_customer: (req.session.access_level == "customer"),
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
    
    // seralize the billData
    const bill = billData.get({ plain: true });

    // save the amount due on the bill as hasOutstandingAmount
    bill.hasOutstandingAmount = bill.amount - bill.amount_paid > 0;

    res.render('customer/pay-bill', {
      logged_in: req.session.logged_in,
      logged_in_as_customer: (req.session.access_level == "customer"),
      bill,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: err});
  }
});

router.get('/payments', withCustomerAuth, async (req, res) => {
  try {
    const customer = req.session.customer_id;
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

    // sort the payments by date
    payments.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.render('customer/payments', {
      logged_in: req.session.logged_in,
      logged_in_as_customer: (req.session.access_level == "customer"),
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
      logged_in_as_customer: (req.session.access_level == "customer"),
      bill
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({message: err});
  }
});

router.get('/update/:id', withCustomerAuth, async (req, res) => {
  try {
    const customerData = await Customer.findOne({
      where: { id: req.session.customer_id}
    })
    const customer = customerData.get({ plain: true });
    console.log(customer);
    
    res.render('customer/updateacc', {
      logged_in: req.session.logged_in,
      logged_in_as_customer: (req.session.access_level == "customer"),
      customer
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({message: err});
  }
})

router.put('/edit/:id', withCustomerAuth, async (req, res) => {
  try {
    const customerData = await Customer.update(req.body, {
      where: { id: req.params.id }
    });
    res.status(200).json(customerData);
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

module.exports = router;