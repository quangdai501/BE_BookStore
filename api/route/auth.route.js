const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth/auth.controller');

router.post('/login', authController.login);

router.post('/login-google', authController.loginGoogle);

router.post('/confirm-email', authController.confirmEmail);

router.post('/fogot-password', authController.fogotPassword);

router.post('/enter-code-reset-pass', authController.enterCodeResetPass);

router.patch('/reset-pass', authController.resetPassword);

module.exports = router;