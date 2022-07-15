const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../utils');

const couponController = require('../controllers/coupon/coupon.controller');

router.get('/', couponController.getAllCoupon);

router.get('/is-valid', couponController.isValidCoupon);

router.post('/', isAuth, isAdmin, couponController.createCoupon);

router.patch('/:id', isAuth, isAdmin, couponController.updateCoupon);

router.delete('/:id', isAuth, isAdmin, couponController.deleteCoupon);

module.exports = router;