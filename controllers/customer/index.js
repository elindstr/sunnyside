const router = require('express').Router();

const customerSideRoutes = require('./customerSideRoutes');
router.use('/', customerSideRoutes);

module.exports = router;