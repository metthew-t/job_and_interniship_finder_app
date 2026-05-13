const { Application, Job, Profile, match_scores } = require('../models');
const matchingService = require('../services/matchingService');

exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    // Check profile completion (FR-12)
    const profile = await Profile.findOne({ where: { userId: req.user.id } });
    if (!profile || profile.profileCompletionPercentage < 80) {
      return res.status(400).json({
        message: 'Profile must be at least 80% complete to apply.',
        completion: profile?.profileCompletionPercentage || 0
      });
    }

    const application = await Application.create({
      jobId,
      userId: req.user.id,
      status: 'applied'
    });

    // Generate AI match score on application (FR-20)
    const { score, explanation } = await matchingService.calculateMatchScore(req.user.id, jobId);
    // Logic to save match score

    res.status(201).json({ application, matchScore: score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { userId: req.user.id },
      include: [{ model: Job }]
    });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getApplicationsForJob = async (req, res) => {
    // Logic for employer to see applications
};

exports.updateStatus = async (req, res) => {
    // Logic to change status: reviewed -> interview etc. (FR-27)
};
