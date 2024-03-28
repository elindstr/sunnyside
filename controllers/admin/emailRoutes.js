const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');
var generator = require('generate-password');
const nodemailer = require('nodemailer');
require('dotenv').config();

// nodemailer credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "sunnyside.sacramento@gmail.com",
      pass: process.env.GAUTH
    },
});

// email user credentials
router.post('/credentials/:id', withAdminAuth, async (req, res) => {
  try {
    // get user data
    const user_id = req.params.id
    const user = await User.findByPk(user_id, {raw: true})
    if (user.access_level == 'customer') {
      const customer = await Customer.findByPk(user.customer_id, {raw: true})
      user.first_name = customer.first_name
      user.last_name = customer.last_name
      user.email = customer.email
    }
    else {
      const employee = await Employee.findByPk(user.employee_id, {raw: true})
      user.first_name = employee.first_name
      user.last_name = employee.last_name
      user.email = employee.email
    }

    // get new password and update user
    const newPassword = generator.generate({
      length: 8,
      numbers: true,
      excludeSimilarCharacters: true
    });
    await User.update({
      password: newPassword
    }, {
      where: { id: user_id }
    });

    // prepare email object
    const emailObject = {
      mailTo: user.email,
      mailSubject: 'Sunnyside User Login',
      mailText: `Hi ${user.first_name}! Here are new login credentials to your Sunnyside online dashboard:\n
      \t username: ${user.username}\n
      \t password: ${newPassword}\n
      \n\n
      Sunnyside Pools`
    }

    // send email
    const info = await transporter.sendMail({
      from: 'Sunnyside Pools <sunnyside.sacramento@gmail.com>',
      to: emailObject.mailTo,
      subject: emailObject.mailSubject,
      text: emailObject.mailText
      //html: emailObject.mailHtml
    });
    res.status(200).json({message: 'success'});

  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});




module.exports = router;