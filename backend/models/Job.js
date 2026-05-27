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
    type: DataTypes.STRING, // Changed from ENUM to STRING to avoid DB casting errors
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'Technology'
  },
  workMode: {
    type: DataTypes.STRING, // Changed from ENUM to STRING to avoid DB casting errors
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
