
const express = require('express');
const router = express.Router();

const authRoute = require('./auth.route');
const productRoute = require('./product.route')
const shopingCartRoute = require('./shoping-cart.route');
const userRoute = require('./user.route');
const orderRoute = require('./order.route');
const categoryRoute = require('./category.route');
const brandRoute = require('./brand.route');


router.use('/auth', authRoute);
router.use('/products', productRoute);
router.use('/shoping-cart', shopingCartRoute);
router.use('/users', userRoute);
router.use('/orders', orderRoute);
router.use('/category', categoryRoute);
router.use('/brand', brandRoute);
module.exports = router;