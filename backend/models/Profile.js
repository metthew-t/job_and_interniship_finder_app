const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Profile = sequelize.define('Profile', {
  university: {
    type: DataTypes.STRING
  },
  courseOfStudy: {
    type: DataTypes.STRING
  },
  expectedGraduationYear: {
    type: DataTypes.INTEGER
  },
  cgpa: {
    type: DataTypes.DECIMAL(3, 2)
  },
  bio: {
    type: DataTypes.TEXT
  },
  resumeUrl: {
    type: DataTypes.STRING
  },
  videoPitchUrl: {
    type: DataTypes.STRING
  },
  profileCompletionPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  locationPreference: {
    type: DataTypes.STRING
  },
  salaryExpectationMin: {
    type: DataTypes.INTEGER
  },
  salaryExpectationMax: {
    type: DataTypes.INTEGER
  },
  workModePreference: {
    type: DataTypes.ENUM('remote', 'hybrid', 'onsite')
  }
}, {
  underscored: true
});

module.exports = Profile;
