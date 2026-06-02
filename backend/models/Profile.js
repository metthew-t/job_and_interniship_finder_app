const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Profile = sequelize.define('Profile', {
  university: { type: DataTypes.STRING },
  courseOfStudy: { type: DataTypes.STRING, field: 'course_of_study' },
  bio: { type: DataTypes.TEXT },
  resumeUrl: { type: DataTypes.STRING, field: 'resume_url' },
  locationPreference: { type: DataTypes.STRING, field: 'location_preference' },
  yearsOfExperience: { type: DataTypes.INTEGER, field: 'years_of_experience' },
  expectedSalary: { type: DataTypes.INTEGER, field: 'expected_salary' },
  skills: { type: DataTypes.STRING },
  profileCompletionPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'profile_completion_percentage'
  }
}, {
  tableName: 'profiles',
  timestamps: true,
  underscored: true
});

module.exports = Profile;
