const withAuth = (req, res, next) => {
  if (!req.session.logged_in) {
    req.session.redirectTo = req.originalUrl //store the url they are seeking
    res.redirect('/login');
  } else {
    next();
  }
};

// controllers/loginRoutes.js sets a req.session.access_level based on the user's User.access_level: "admin", "employee", or "customer".
const withAdminAuth = (req, res, next) => {
  if (!req.session.logged_in || req.session.access_level !== "admin") {
    req.session.redirectTo = req.originalUrl;
    res.redirect('/login');
  } else {
    next()
  }
};

const withEmployeeAuth = (req, res, next) => {
  if (!req.session.logged_in || (req.session.access_level !== "employee" && req.session.access_level !== "admin")) {
    req.session.redirectTo = req.originalUrl;
    res.redirect('/login');
  } else {
    next()
  }
};

const withCustomerAuth = (req, res, next) => {
  if (!req.session.logged_in || (req.session.access_level !== "customer" && req.session.access_level !== "admin")) {
    req.session.redirectTo = req.originalUrl;
    res.redirect('/login');
  } else {
    next()
  }
};

module.exports = {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth};
