const router = require('express').Router();
const { User } = require('../models');

router.post('/login', async (req, res) => {
  try {
    const userData = await User.findOne({ where: { username: req.body.username } });
    if (!userData) {
      console.log("error logging in: username not found")
      res
        .status(400)
        .json({ message: `Incorrect username or password, please try again.` });
      return;
    }
    const validPassword = await userData.checkPassword(req.body.password);
    if (!validPassword) {
      console.log("error logging in: invalid password")
      res.status(400).json({ message: 'Incorrect email or password, please try again' });
      return;
    }
    req.session.save(() => {
      console.log("successful login")
      req.session.user_id = userData.id;
      req.session.logged_in = true;
      req.session.access_level = userData.access_level
      req.session.employee_id = userData.employee_id
      req.session.customer_id = userData.customer_id
      res.json({ user: userData, message: 'You are now logged in.' });
    });

  } catch (err) {
    console.log("unsuccessful: ", err)
    res.status(400).json(err);
  }
});

module.exports = router;
