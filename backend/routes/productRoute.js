const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails } = require('../controllers/productController');
const { isUserAuthenticated, authorizeRoles } = require('../middleware/auth');


const router = express.Router();

router.route('/products').get(getAllProducts)
router.route('/product/new').post(isUserAuthenticated, authorizeRoles,createProduct)

router.route('/product/:id').put(isUserAuthenticated, authorizeRoles, updateProduct).delete(isUserAuthenticated, authorizeRoles, deleteProduct).get(getProductDetails)

module.exports = router
