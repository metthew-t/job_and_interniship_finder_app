const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-2fa', authController.verify2FA);

// OAuth routes
router.get('/google', authController.googleLogin);
router.get('/linkedin', authController.linkedinLogin);

module.exports = router;
