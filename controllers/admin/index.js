const router = require('express').Router();

const customerRoutes = require('./customerRoutes');
router.use('/customers', customerRoutes);

module.exports = router;