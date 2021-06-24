const express = require('express');
const router = express.Router();
const shopingCartController = require('../controllers/shoping-cart/shoping-cart.controller');
const { isAuth } = require('../utils');

router.post('/', isAuth, shopingCartController.addToCart);
router.get('/allProduct/:userID', isAuth, shopingCartController.getAllProductByUserId);
//delete product from shoping-cart
router.delete('/:userID/:productID', isAuth, shopingCartController.deleteProductFromCard);
// update quantity of product
router.patch('/updateCard', isAuth, shopingCartController.updateCard);

module.exports = router;