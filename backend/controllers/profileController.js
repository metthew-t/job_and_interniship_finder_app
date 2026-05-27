const { Profile, User, Employer } = require('../models');

// Safe calculation
const calculate = (profile, user) => {
    let score = 0;
    if (user && user.firstName && user.lastName) score += 20;

    if (user.role === 'employer') {
        if (profile.companyName && profile.companyName !== 'Not set') score += 20;
        if (profile.industry && profile.industry !== 'Not set') score += 20;
        if (profile.website && profile.website !== 'Not set') score += 20;
        if (profile.description && profile.description !== 'Not set') score += 20;
    } else {
        if (profile.university && profile.university !== 'Not set') score += 20;
        if (profile.courseOfStudy && profile.courseOfStudy !== 'Not set') score += 20;
        if (profile.locationPreference && profile.locationPreference !== 'Not set') score += 20;
        if (profile.resumeUrl) score += 20;
    }
    return Math.min(score, 100);
};

exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (user.role === 'employer') {
            let employer = await Employer.findOne({
                where: { userId },
                include: [{ model: User, attributes: ['firstName', 'lastName', 'email', 'role'] }]
            });
            if (!employer) {
                employer = await Employer.create({ userId, companyName: `${user.firstName}'s Company` });
                employer = await Employer.findOne({
                    where: { userId },
                    include: [{ model: User, attributes: ['firstName', 'lastName', 'email', 'role'] }]
                });
            }
            return res.json(employer);
        } else {
            let profile = await Profile.findOne({
                where: { userId },
                include: [{ model: User, attributes: ['firstName', 'lastName', 'email', 'role'] }]
            });

            if (!profile) {
                profile = await Profile.create({ userId });
                profile = await Profile.findOne({
                    where: { userId },
                    include: [{ model: User, attributes: ['firstName', 'lastName', 'email', 'role'] }]
                });
            }
            return res.json(profile);
        }
    } catch (e) {
        console.error('[GetProfile] Error:', e);
        res.status(500).json({ error: e.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;
        const user = await User.findByPk(userId);
        console.log(`[UpdateProfile] Request for user ${userId} (${user.role}):`, data);

        // 1. Update Names in User table
        if (data.firstName || data.lastName) {
            await User.update({
                ...(data.firstName && { firstName: data.firstName }),
                ...(data.lastName && { lastName: data.lastName })
            }, { where: { id: userId } });
        }

        let resultData;

        if (user.role === 'employer') {
            // 2. Update Employer table
            let employer = await Employer.findOne({ where: { userId } });
            if (!employer) employer = await Employer.create({ userId, companyName: `${user.firstName}'s Company` });

            const employerFields = ['companyName', 'industry', 'website', 'description', 'companySize'];
            const updates = {};
            employerFields.forEach(f => {
                if (data[f] !== undefined) updates[f] = data[f];
            });

            await employer.update(updates);

            // Recalculate score for Employer
            const freshUser = await User.findByPk(userId);
            const freshEmployer = await Employer.findOne({ where: { userId } });
            const newScore = calculate(freshEmployer, freshUser);
            await freshEmployer.update({ profileCompletionPercentage: newScore });

            resultData = await Employer.findOne({
                where: { userId },
                include: [{ model: User, attributes: ['firstName', 'lastName', 'email', 'role'] }]
            });
        } else {
            // 2. Find/Update Profile table
            let profile = await Profile.findOne({ where: { userId } });
            if (!profile) profile = await Profile.create({ userId });

            const fields = ['university', 'courseOfStudy', 'bio', 'locationPreference', 'yearsOfExperience', 'expectedSalary', 'skills'];
            const updates = {};
            fields.forEach(f => {
                if (data[f] !== undefined) updates[f] = data[f];
            });

            await profile.update(updates);

            // 3. Recalculate score
            const freshUser = await User.findByPk(userId);
            const freshProfile = await Profile.findOne({ where: { userId } });
            const newScore = calculate(freshProfile, freshUser);
            await freshProfile.update({ profileCompletionPercentage: newScore });

            resultData = await Profile.findOne({
                where: { userId },
                include: [{ model: User, attributes: ['firstName', 'lastName', 'email', 'role'] }]
            });
        }

        console.log('[UpdateProfile] SUCCESS');
        res.json(resultData);

    } catch (e) {
        console.error('[UpdateProfile] CRITICAL ERROR:', e);
        res.status(500).json({ error: 'Database error' });
    }
};

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file' });
        const userId = req.user.id;

        let profile = await Profile.findOne({ where: { userId } });
        if (!profile) profile = await Profile.create({ userId });

        await profile.update({ resumeUrl: req.file.filename });

        const user = await User.findByPk(userId);
        const score = calculate(profile, user);
        await profile.update({ profileCompletionPercentage: score });

        res.json({ message: 'Uploaded', score });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.uploadVideo = async (req, res) => {
    res.json({ message: 'Stub' });
};
