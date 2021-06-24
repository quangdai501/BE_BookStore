const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth/auth.controller');

router.post('/login', authController.login);

router.post('/confirm-email', authController.confirmEmail);

router.post('/fogot-password', authController.fogotPassword);

router.post('/enter-code-reset-pass', authController.enterCodeResetPass);

module.exports = router;
