const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');
const { Sequelize, Op } = require('sequelize');

// save new payment
router.get('/', withAdminAuth, async (req, res) => {
  try {
    const customers = await Customer.findAll({ order: [['last_name', 'ASC']], raw: true });

    res.render('admin/payment-create', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin"),
      customers
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// for creating new payment (POST)
router.post('/create', withAdminAuth, async (req, res) => {
  try {
    // create payment record
    const paymentData = await Payment.create(req.body);

    // payoff function:           
    let allPaid = false
    let paymentAmountRemaining = req.body.amount
    while (!allPaid && paymentAmountRemaining > 0 ) {

      // find oldest unpaid invoice; 
      let oldestUnpaidInvoice = await Invoice.findAll({
        where: {
            amount: {
                [Sequelize.Op.gt]: Sequelize.col('amount_paid')
            }
        },
        order: [['date', 'ASC']],
        limit: 1,
        raw: true
      });

      //pay oldest invoice up to the amount due
      if (oldestUnpaidInvoice.length) {
        let unpaidBalance =  oldestUnpaidInvoice[0].amount - oldestUnpaidInvoice[0].amount_paid
        
        if (paymentAmountRemaining >= unpaidBalance) {
          let amountToPay = unpaidBalance;
          await Invoice.update(
            { amount_paid: Sequelize.literal(`amount_paid + ${amountToPay}`) },
            { where: { id: oldestUnpaidInvoice[0].id } } 
          );
          await Payment.update(
            { invoice_id: oldestUnpaidInvoice[0].id},
            { where: { id: paymentData.id} } 
          );
          paymentAmountRemaining -= unpaidBalance;
        }

        else {
          await Invoice.update(
            { amount_paid: Sequelize.literal(`amount_paid + ${paymentAmountRemaining}`) },
            { where: { id: oldestUnpaidInvoice[0].id } } 
          );
          paymentAmountRemaining = 0;
        }

      } // !oldestUnpaidInvoice.length
      else {
        allPaid = true
      }
      
      //if positive remainder, re-search for oldest unpaid invoice and pay;
    }

    //check all paid for remainder and add to customer balance
    if (paymentAmountRemaining > 0) {
      await Customer.update(
        { account_balance: Sequelize.literal(`account_balance + ${paymentAmountRemaining}`) },
        { where: { id: req.body.customer_id } } 
      );
    }

    // return
    res.status(200).json(paymentData);
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// Delete payment
router.delete('/delete/:id', withAdminAuth, async (req, res) => {
  try {

    // de-associate invoices / customer credit
    //...

    // destroy
    await Payment.destroy({
      where: { id: req.params.id }
    });
    res.status(200).json({ message: `success deleting payment`});
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
})

module.exports = router;