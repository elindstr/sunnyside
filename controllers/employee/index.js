const router = require('express').Router();

const employeeSideRoutes = require('./employeeSideRoutes');
router.use('/',employeeSideRoutes);

module.exports = router;