const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const { withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth } = require('../../utils/auth');
const { sendEmail } = require('../../utils/email');
var generator = require('generate-password');


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
      from: 'Sunnyside Pools <sunnyside.sacramento@gmail.com>',
      to: user.email,
      subject: 'Sunnyside User Login',
      text: `Hi ${user.first_name}! Here are new login credentials to your Sunnyside online dashboard <https://sunnyside-699326087e54.herokuapp.com/>:\n
      \t username: ${user.username}\n
      \t password: ${newPassword}\n
      \n\n
      Sunnyside Pools`,
      html: `<p>Hi ${user.first_name}! Here are new login credentials to your Sunnyside <a href="https://sunnyside-699326087e54.herokuapp.com/">online dashboard</a>:</p>
      <ul>
          <li>username: ${user.username}</li>
          <li>password: ${newPassword}</li>
      </ul><br>
      
      <p>Sunnyside Pools</p>`,
    }
    
    // send email
    const info = await sendEmail(emailObject)

    res.status(200).json({message: 'success'});
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

module.exports = router;