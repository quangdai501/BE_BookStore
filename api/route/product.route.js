const express = require('express');
const router = express.Router();
const productController = require('../controllers/product/product.controller');
const { isAuth, isAdmin } = require('../utils');

// Get all products
router.get('/', productController.getAllProduct);
// Get special product
router.get('/:id', productController.getProductById);

// add a product
router.post('/addProduct', isAuth, isAdmin, productController.addProduct);

//Delete Product By ID
router.delete('/deleteProduct/:productID', isAuth, isAdmin, productController.deleteProductByID);

//Update product by ID
router.patch('/updateProduct/:productID', isAuth, isAdmin, productController.updateProductByID);
//Update quantity by ID
router.patch('/updateProductQuantity/:productID', isAuth, productController.updateProductQuantityByID);
//Get by category ID
// router.get('/getProductByCategoryID/:productName', productController.getProductByCategoryName);

//Get by brand ID
// router.get('/getProductByBrandID/:brandName', productController.getProductByBrandName);

module.exports = router;
