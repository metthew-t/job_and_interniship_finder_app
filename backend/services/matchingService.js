const { Job, User, Profile, Skill } = require('../models');

/**
 * Calculates match score between a user and a job.
 * Weights:
 * Skills Match: 40%
 * Experience: 25%
 * Education: 15%
 * Location: 10%
 * Availability (Work Mode): 10%
 */
exports.calculateMatchScore = async (userId, jobId) => {
  const job = await Job.findByPk(jobId, { include: ['skills'] });
  const user = await User.findByPk(userId, {
    include: [
      { model: Profile, as: 'profile' },
      { model: Skill, as: 'skills' },
      'experience',
      'education'
    ]
  });

  if (!job || !user) return { score: 0, explanation: "User or Job not found" };

  let score = 0;
  let explanation = [];

  // 1. Skills Match (40%)
  const jobSkillNames = job.skills.map(s => s.name.toLowerCase());
  const userSkillNames = user.skills.map(s => s.name.toLowerCase());
  const matchingSkills = userSkillNames.filter(s => jobSkillNames.includes(s));

  const skillScore = jobSkillNames.length > 0
    ? (matchingSkills.length / jobSkillNames.length) * 40
    : 40;
  score += skillScore;
  explanation.push(`Skills Match: ${matchingSkills.length}/${jobSkillNames.length} matched (${skillScore.toFixed(1)}%)`);

  // 2. Experience Relevance (25%)
  // Simple check: does any experience title match job title or is there relevant experience?
  const jobTitle = job.title.toLowerCase();
  const hasRelevantExp = user.experience.some(exp =>
    exp.jobTitle.toLowerCase().includes(jobTitle) ||
    jobTitle.includes(exp.jobTitle.toLowerCase())
  );

  const expScore = hasRelevantExp ? 25 : (user.experience.length > 0 ? 15 : 0);
  score += expScore;
  explanation.push(`Experience: ${hasRelevantExp ? 'Highly relevant' : (user.experience.length > 0 ? 'Some experience' : 'No experience')} (${expScore}%)`);

  // 3. Education Fit (15%)
  // Simple check: does profile course of study match job requirements?
  const eduScore = user.profile?.courseOfStudy ? 15 : 0;
  score += eduScore;
  explanation.push(`Education: ${user.profile?.courseOfStudy ? 'Provided' : 'Not provided'} (${eduScore}%)`);

  // 4. Location Preference (10%)
  const locationMatch = user.profile?.locationPreference === job.location;
  const locScore = locationMatch ? 10 : (job.workMode === 'remote' ? 10 : 0);
  score += locScore;
  explanation.push(`Location: ${locationMatch ? 'Matches' : (job.workMode === 'remote' ? 'Remote job' : 'No match')} (${locScore}%)`);

  // 5. Availability (Work Mode) (10%)
  const workModeMatch = user.profile?.workModePreference === job.workMode;
  const wmScore = workModeMatch ? 10 : 5;
  score += wmScore;
  explanation.push(`Work Mode: ${workModeMatch ? 'Matches' : 'Flexible'} (${wmScore}%)`);

  return {
    score: Math.round(score),
    explanation
  };
};
