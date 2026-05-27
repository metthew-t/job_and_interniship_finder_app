const { Job, Profile, User } = require('../models');

/**
 * Calculates a match score between a user's profile and a job description.
 * This is a rule-based engine simulating AI analysis.
 */
exports.calculateMatchScore = async (userId, jobId) => {
  try {
    const job = await Job.findByPk(jobId);
    const profile = await Profile.findOne({ where: { userId } });
    const user = await User.findByPk(userId);

    if (!job || !profile) return { score: 0, feedback: "Profile or job not found." };

    let score = 0;
    let feedback = [];

    // 1. Skill Matching (Keyword analysis)
    const profileText = `${profile.bio || ''} ${profile.courseOfStudy || ''} ${profile.university || ''}`.toLowerCase();
    const jobText = `${job.title} ${job.description} ${job.requirements}`.toLowerCase();

    // Define some keywords per category
    const itKeywords = ['flutter', 'dart', 'node', 'javascript', 'api', 'backend', 'developer', 'software'];
    const financeKeywords = ['finance', 'accounting', 'excel', 'analyst', 'bank'];
    const designKeywords = ['figma', 'ui', 'ux', 'design', 'adobe', 'prototype'];

    let matchedKeywords = [];
    [...itKeywords, ...financeKeywords, ...designKeywords].forEach(kw => {
      if (jobText.includes(kw) && profileText.includes(kw)) {
        score += 10;
        matchedKeywords.push(kw);
      }
    });

    if (matchedKeywords.length > 0) {
      feedback.push(`Matched skills: ${matchedKeywords.join(', ')}.`);
    } else {
      feedback.push("No specific skill keywords matched between your profile and the job requirements.");
    }

    // 2. Education match
    if (profile.courseOfStudy) {
      const course = profile.courseOfStudy.toLowerCase();
      if (jobText.includes(course)) {
        score += 20;
        feedback.push(`Your background in ${profile.courseOfStudy} is a great fit.`);
      }
    }

    // 3. Location / Work Mode
    if (job.workMode === 'remote') {
      score += 10;
      feedback.push("This is a remote position, offering flexibility.");
    } else if (profile.locationPreference && job.location && job.location.toLowerCase().includes(profile.locationPreference.toLowerCase())) {
      score += 10;
      feedback.push("Located in your preferred area.");
    }

    // Final result
    score = Math.min(score, 100);

    let summary = "";
    if (score >= 70) summary = "Excellent match! Your profile aligns strongly with this role.";
    else if (score >= 40) summary = "Good match. You have several relevant qualifications.";
    else summary = "Partial match. Consider highlighting more relevant skills in your bio.";

    return {
      score,
      summary,
      details: feedback.join(' ')
    };
  } catch (error) {
    console.error("AI Service Error:", error);
    return { score: 0, feedback: "Error calculating match." };
  }
};
