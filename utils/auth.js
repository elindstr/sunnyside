const withAuth = (req, res, next) => {
  if (!req.session.logged_in) {
    req.session.redirectTo = req.originalUrl //store the url they are seeking
    res.redirect('/login');
  } else {
    next();//if they are logged in, continue with the request
  }
};

// controllers/loginRoutes.js sets a req.session.access_level based on the user's User.access_level: "admin", "employee", or "customer".
const withAdminAuth = (req, res, next) => {
  if (!req.session.logged_in || req.session.access_level !== "admin") {
    req.session.redirectTo = req.originalUrl;
    res.redirect('/login');
  } else {
    next()//if they are logged in as an admin, continue with the request
  }
};

const withEmployeeAuth = (req, res, next) => {
  if (!req.session.logged_in || (req.session.access_level !== "employee" && req.session.access_level !== "admin")) {
    req.session.redirectTo = req.originalUrl;
    res.redirect('/login');
  } else {
    next()//if they are logged in as an employee, continue with the request
  }
};

const withCustomerAuth = (req, res, next) => {
  if (!req.session.logged_in || (req.session.access_level !== "customer" && req.session.access_level !== "admin")) {
    req.session.redirectTo = req.originalUrl;
    res.redirect('/login');
  } else {
    next()//if they are logged in as a customer, continue with the request
  }
};

module.exports = {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth};
