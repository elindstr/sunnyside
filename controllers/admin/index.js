const router = require('express').Router();

const customerRoutes = require('./customerRoutes');
router.use('/customers', customerRoutes);

const emailRoutes = require('./emailRoutes');
router.use('/email', emailRoutes);

const employeeRoutes = require('./employeeRoutes');
router.use('/employees', employeeRoutes);

const invoiceRoutes = require('./invoiceRoutes');
router.use('/invoices', invoiceRoutes);

const paymentRoutes = require('./paymentRoutes');
router.use('/payments', paymentRoutes);

const productRoutes = require('./productRoutes');
router.use('/products', productRoutes);

const recordRoutes = require('./recordRoutes');
router.use('/records', recordRoutes);

const reportRoutes = require('./reportRoutes');
router.use('/reports', reportRoutes);

const userRoutes = require('./userRoutes');
router.use('/users', userRoutes);

module.exports = router;