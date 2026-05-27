const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const aiService = require('../services/aiService');

// Get job match score for a specific job
router.get('/score/:jobId', protect, async (req, res) => {
  try {
    const result = await aiService.calculateMatchScore(req.user.id, req.params.jobId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get candidate matches for a job
router.get('/candidate-matches/:jobId', protect, async (req, res) => {
  try {
    res.status(200).json({ 
      message: 'Candidate matching endpoint - to be implemented',
      matches: []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;