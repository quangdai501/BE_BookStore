const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../utils');

const couponController = require('../controllers/coupon/coupon.controller');

router.get('/', isAuth, couponController.getAllCoupon);

router.get('/is-valid', isAuth, couponController.isValidCoupon);

router.get('/:id', isAuth, isAdmin, couponController.getCoupon);

router.post('/', isAuth, isAdmin, couponController.createCoupon);

router.patch('/:id', isAuth, isAdmin, couponController.updateCoupon);

router.delete('/:id', isAuth, isAdmin, couponController.deleteCoupon);

module.exports = router;