const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');

const { protect } = require('../middleware/auth');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/me', protect, authController.getMe);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-2fa', authController.verify2FA);

// OAuth routes
router.post('/google', authController.googleLogin);
router.post('/linkedin', authController.linkedinLogin);

module.exports = router;
