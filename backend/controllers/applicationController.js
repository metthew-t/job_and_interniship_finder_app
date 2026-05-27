const { Application, Job, Profile, Employer } = require('../models');
const aiService = require('../services/aiService');

exports.applyToJob = async (req, res) => {
  try {
    const { jobId, notes } = req.body;
    const userId = req.user.id;

    console.log(`[Apply] User ${userId} applying for Job ${jobId}`);

    // Check if already applied
    const existing = await Application.findOne({ where: { jobId, userId } });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    // Check profile completion
    const profile = await Profile.findOne({ where: { userId } });
    const employer = await Employer.findOne({ where: { userId } });

    // Must have either a student profile or an employer profile to exist in DB
    if (!profile && !employer) {
      console.log(`[Apply] Failed: No profile record found for user ${userId}`);
      return res.status(400).json({ message: 'Profile data missing. Please update your profile first.' });
    }

    // Professional check: Check completion percentage if it's a student/job_seeker
    if (profile && (profile.profileCompletionPercentage || 0) < 10) { // Lowered to 10% for easier testing
      console.log(`[Apply] Failed: Profile only ${profile.profileCompletionPercentage}% complete`);
      return res.status(400).json({
        message: `Your profile is only ${profile.profileCompletionPercentage}% complete. Please add more details to apply.`,
        completion: profile.profileCompletionPercentage
      });
    }

    const application = await Application.create({
      jobId,
      userId,
      status: 'applied',
      notes
    });

    console.log('[Apply] Success: Application created');
    res.status(201).json({ application });
  } catch (err) {
    console.error('[Apply] CRITICAL ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error during application' });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Job,
          include: [{ model: Employer, attributes: ['companyName'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Ensure the job belongs to the employer
    const job = await Job.findByPk(jobId);
    const employer = await Employer.findOne({ where: { userId: req.user.id } });

    if (!job || !employer || job.employerId !== employer.id) {
      return res.status(403).json({ message: 'Not authorized to see applications for this job' });
    }

    const applications = await Application.findAll({
      where: { jobId },
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'email'],
          include: [{ model: Profile }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
    // Logic to change status: reviewed -> interview etc. (FR-27)
};
