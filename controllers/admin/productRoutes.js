const router = require('express').Router();
const { Customer, Employee, Expense, Interaction, Invoice, Payment, Product, Service, User } = require('../../models');
const {withAuth, withAdminAuth, withEmployeeAuth, withCustomerAuth} = require('../../utils/auth');

// for product manager
router.get('/', withAdminAuth, async (req, res) => {
  try {
    const products = await Product.findAll({ raw: true });
    res.render('admin/products-manage', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin"),
      products
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// for serving the create new product page (GET)
router.get('/create', withAdminAuth, async (req, res) => {
  try {
    const products = await Product.findAll({raw: true});
    res.render('admin/products-create', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin"),
      products,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// for creating new product (POST)
router.post('/create', withAdminAuth, async (req, res) => {
  try {
    const productData = await Product.create(req.body);
    res.status(200).json(productData);
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// GET for updating existing product
router.get('/edit/:id', withAdminAuth, async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id);
    const product = productData.get({ plain: true })
    res.render('admin/products-edit', {
      logged_in: req.session.logged_in,
      logged_in_as_admin: (req.session.access_level == "admin"),
      product,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// Update existing product
router.put('/edit/:id', withAdminAuth, async (req, res) => {
  try {
    console.log(`received request to update ${req.params.id}`)
    const productData = await Product.update(req.body, {
      where: { id: req.params.id }
    });
    res.status(200).json(productData);
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
});

// Delete product
router.delete('/edit/:id', withAdminAuth, async (req, res) => {
  try {
    await Product.destroy({
      where: { id: req.params.id }
    });
    res.status(200).json({ message: `success deleting id=${req.params.id}`});
  } catch (err) {
    console.log(err)
    res.status(500).json({message: err});
  }
})

module.exports = router;