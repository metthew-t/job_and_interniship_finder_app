const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Profile = sequelize.define('Profile', {
  university: { type: DataTypes.STRING },
  courseOfStudy: { type: DataTypes.STRING },
  bio: { type: DataTypes.TEXT },
  resumeUrl: { type: DataTypes.STRING },
  locationPreference: { type: DataTypes.STRING },
  yearsOfExperience: { type: DataTypes.INTEGER },
  expectedSalary: { type: DataTypes.INTEGER },
  skills: { type: DataTypes.STRING },
  profileCompletionPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'profiles',
  timestamps: true,
  underscored: true // This converts courseOfStudy -> course_of_study in DB
});

module.exports = Profile;
