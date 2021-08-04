const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brand/brand.controller');
const { isAuth, isAdmin } = require('../utils');
const { route } = require('./auth.route');

router.post('', brandController.addBrand);
router.get('/getBrandByID/:brandID', brandController.getBrandById);
router.get('/getAllBrand', brandController.getAllBrand);
router.patch('/updateBrand/:brandID', isAuth, isAdmin, brandController.updateBrand);
router.delete('/deleteBrand/:brandID', isAuth, isAdmin, brandController.deleteBrand);

module.exports = router;