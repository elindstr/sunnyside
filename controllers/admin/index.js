const router = require('express').Router();

const customerRoutes = require('./customerRoutes');
router.use('/customers', customerRoutes);

const employeeRoutes = require('./employeeRoutes');
router.use('/employees', employeeRoutes);

const invoiceRoutes = require('./invoiceRoutes');
router.use('/invoices', invoiceRoutes);

const productRoutes = require('./productRoutes');
router.use('/products', productRoutes);

module.exports = router;