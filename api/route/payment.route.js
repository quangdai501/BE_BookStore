const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment/payment.controller')

router.get('/vnpay_return', paymentController.returnPayment);
router.get('/vnpay_ipn', paymentController.inpPayment);
router.post('/create_payment_url', paymentController.createPayment);


module.exports = router;