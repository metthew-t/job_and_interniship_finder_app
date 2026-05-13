const { Job, Employer } = require('../models');

exports.getAllJobs = async (req, res) => {
  try {
    const { keyword, location, type, workMode } = req.query;
    // Basic filtering logic
    const jobs = await Job.findAll({
      where: {
        isActive: true,
        ...(location && { location }),
        ...(type && { jobType: type }),
        ...(workMode && { workMode })
      },
      include: [{ model: Employer, attributes: ['companyName', 'companyLogo'] }]
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [{ model: Employer }]
    });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const employer = await Employer.findOne({ where: { userId: req.user.id } });
    if (!employer) return res.status(403).json({ message: 'Employer profile required' });

    const job = await Job.create({
      ...req.body,
      employerId: employer.id
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateJob = async (req, res) => {
    // Logic to update job
};

exports.deleteJob = async (req, res) => {
    // Logic to delete job
};
