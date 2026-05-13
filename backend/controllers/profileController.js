const { Profile, User, Skill } = require('../models');
const resumeParser = require('../services/resumeParser');

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, attributes: ['email', 'firstName', 'lastName'] }]
    });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await Profile.create({ ...req.body, userId: req.user.id });
    } else {
      await profile.update(req.body);
    }

    // Logic to update skills if provided
    if (req.body.skills) {
      // Skill update logic
    }

    // Update profile completion percentage (FR-12)
    const completion = calculateCompletion(profile, req.user);
    await profile.update({ profileCompletionPercentage: completion });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Parse resume (FR-08)
    const parsedData = await resumeParser.parse(req.file.path);

    // Save resume URL (mocking S3/Cloudinary)
    const resumeUrl = `https://storage.com/${req.file.filename}`;

    await Profile.update(
      { resumeUrl, bio: parsedData.text.substring(0, 500) },
      { where: { userId: req.user.id } }
    );

    res.json({ message: 'Resume uploaded and parsed', skills: parsedData.skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadVideo = async (req, res) => {
  // Logic for video pitch upload (FR-10)
  res.json({ message: "Video uploaded successfully" });
};

function calculateCompletion(profile, user) {
  let points = 0;
  if (user.firstName && user.lastName) points += 20;
  if (profile.bio) points += 20;
  if (profile.resumeUrl) points += 20;
  if (profile.university) points += 20;
  // Add more checks
  return Math.min(points, 100);
}
