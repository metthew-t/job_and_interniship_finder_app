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

exports.getMyJobs = async (req, res) => {
  try {
    const employer = await Employer.findOne({ where: { userId: req.user.id } });
    if (!employer) return res.status(403).json({ message: 'Employer profile required' });

    const jobs = await Job.findAll({
      where: { employerId: employer.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(jobs);
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
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const employer = await Employer.findOne({ where: { userId: req.user.id } });
    if (!employer || job.employerId !== employer.id) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    await job.update(req.body);
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const employer = await Employer.findOne({ where: { userId: req.user.id } });
    if (!employer || job.employerId !== employer.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.destroy();
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
