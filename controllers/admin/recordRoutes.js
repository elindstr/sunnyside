const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');
const { Op } = require('sequelize');

// view all records
router.get('/', withAdminAuth, async (req, res) => {
    try {

      // default object
      let searchObj = {
        dateAfter: '2000-01-01',
        dateBefore: '2099-01-01',
        includeService: true,
        includeExpense: true,
        includeInvoice: true,
        includePayment: true,
        filterByCustomer: 'any'
      }
      let whereClause = {}

      // if incoming query, update object
      if (Object.keys(req.query).length) {
        searchObj = {
          dateAfter: req.query.dateAfter,
          dateBefore: req.query.dateBefore,
        };

        req.query.includeService?
          searchObj.includeService = true: 
          searchObj.includeService = false
        req.query.includeExpense?
          searchObj.includeExpense = true: 
          searchObj.includeExpense = false 
        req.query.includeInvoice?
          searchObj.includeInvoice = true: 
          searchObj.includeInvoice = false
        req.query.includePayment?
          searchObj.includePayment = true: 
          searchObj.includePayment = false

        if (req.query.filterByCustomer) {
          searchObj.filterByCustomer = req.query.filterByCustomer
        }
        else {
          searchObj.filterByCustomer = "any"
        }

      
        // setup where clause
        whereClause = {
          date: {
            [Op.gte]: searchObj.dateAfter,
            [Op.lte]: searchObj.dateBefore
          }
        }
        if (searchObj.filterByCustomer != "any") {
          whereClause.customer_id = req.query.filterByCustomer
        }
      }

      // get customer record history
      let services = await Service.findAll({
        include: [
          {model: Product}
        ],
        where: whereClause,
        raw: true
      });
      //convert product.rate to "amount" for flattening into other objects
      services = services.map(service => ({
        ...service,
        amount: service['product.rate'],
        type: 'Service'
      }));

      const expenses = await Expense.findAll({
        where: whereClause,
        raw: true
      });
      const invoices = await Invoice.findAll({
        where: whereClause,
        attributes: {
          include: [['id', 'invoice_id']], 
          exclude: ['content'],
        },
        raw: true
      });
      const payments = await Payment.findAll({
        where: whereClause,
        raw: true
      });
      
      // combine records
      let allRecords = [];
      const addType = (array, type) => array.map(item => ({ ...item, type }));

      if (searchObj.includeService) {
        allRecords = allRecords.concat(addType(services, 'Service'))
      }
      if (searchObj.includeExpense) {
        allRecords = allRecords.concat(addType(expenses, 'Expense'))
      }
      if (searchObj.includeInvoice) {
        allRecords = allRecords.concat(addType(invoices, 'Invoice'))
      }
      if (searchObj.includePayment) {
        allRecords = allRecords.concat(addType(payments, 'Payment'))
      }

      // sort by date
      allRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // for user selection
      const customers = await Customer.findAll({order: [['last_name', 'ASC']], raw: true})

      //add customer names to allRecords
      for (record of allRecords) {
        const names = await Customer.findByPk(record.customer_id, {
          attributes: ['first_name', 'last_name'],
          raw: true
      });
        record.first_name = names.first_name
        record.last_name = names.last_name
      }

      console.log(allRecords)

      //render
      res.render('admin/records', {
        logged_in: req.session.logged_in,
        logged_in_as_admin: (req.session.access_level == "admin"),
        allRecords, customers, searchObj: JSON.stringify(searchObj)
      })
    } catch (err) {
      console.log(err)
      res.status(500).json({message: err});
    }
  });

  module.exports = router;