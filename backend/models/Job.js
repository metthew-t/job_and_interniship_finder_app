const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requirements: {
    type: DataTypes.TEXT
  },
  location: {
    type: DataTypes.STRING
  },
  salaryMin: {
    type: DataTypes.INTEGER
  },
  salaryMax: {
    type: DataTypes.INTEGER
  },
  jobType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'internship', 'contract'),
    allowNull: false
  },
  workMode: {
    type: DataTypes.ENUM('remote', 'hybrid', 'onsite'),
    defaultValue: 'onsite'
  },
  deadline: {
    type: DataTypes.DATE
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  underscored: true
});

module.exports = Job;
