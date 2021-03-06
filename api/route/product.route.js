const express = require('express');
const router = express.Router();
const productController = require('../controllers/product/product.controller');
const { isAuth, isAdmin } = require('../utils');

// Get all products
router.get('/', productController.getAllProduct);
// Get special product
router.get('/:id', productController.getProductById);
// Get recommend products
router.get('/:id/recommend', productController.getRecommendProducts);
//get all review by product id
router.get('/:id/reviews', productController.getAllReviewById);

// add a product
router.post('/addProduct', isAuth, isAdmin, productController.addProduct);
// add a product
router.post('/createreview/:productID', isAuth, productController.createReview);
// router.post('/addProduct', productController.addProduct);
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