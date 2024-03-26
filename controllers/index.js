const router = require('express').Router();

const homeRoutes = require('./homeRoutes');
router.use('/', homeRoutes);

const loginRoutes = require('./loginRoutes');
router.use('/', loginRoutes);

const adminRoutes = require('./admin');
router.use('/admin', adminRoutes);

const customerSideRoutes = require('./customer');
router.use('/customer', customerSideRoutes);

module.exports = router;
