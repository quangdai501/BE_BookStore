const express = require('express');
const router = express.Router();
const { isAuth, isAdmin } = require('../utils');
const statisticController = require('../controllers/statistic/statistic.controller');
// get all
router.get('/', isAuth, isAdmin, statisticController.getAll);
router.get('/top-sale-product', isAuth, isAdmin, statisticController.getTopSaleProduct);
router.get('/get-revenue', isAuth, isAdmin, statisticController.getRevenue);
router.get('/get-new-review', isAuth, isAdmin, statisticController.getNewReviews);
module.exports = router;