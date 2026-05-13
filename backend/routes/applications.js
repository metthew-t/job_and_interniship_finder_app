const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('student', 'job_seeker'), applicationController.applyToJob);
router.get('/my-applications', protect, applicationController.getMyApplications);
router.get('/job/:jobId', protect, authorize('employer', 'admin'), applicationController.getApplicationsForJob);
router.put('/:id/status', protect, authorize('employer', 'admin'), applicationController.updateStatus);

module.exports = router;
