const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
  status: {
    type: DataTypes.ENUM('applied', 'reviewed', 'interview', 'offered', 'rejected'),
    defaultValue: 'applied'
  },
  resumeSnapshotUrl: {
    type: DataTypes.STRING
  }
}, {
  underscored: true
});

module.exports = Application;
