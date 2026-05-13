const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);
router.post('/', protect, authorize('employer', 'admin'), jobController.createJob);
router.put('/:id', protect, authorize('employer', 'admin'), jobController.updateJob);
router.delete('/:id', protect, authorize('employer', 'admin'), jobController.deleteJob);

module.exports = router;
