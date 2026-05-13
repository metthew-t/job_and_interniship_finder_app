const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/me', protect, profileController.getMyProfile);
router.put('/me', protect, profileController.updateProfile);
router.post('/resume', protect, upload.single('resume'), profileController.uploadResume);
router.post('/video', protect, upload.single('video'), profileController.uploadVideo);

module.exports = router;
