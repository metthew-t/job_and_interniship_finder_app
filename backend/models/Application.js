const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
  status: {
    type: DataTypes.STRING,
    defaultValue: 'applied'
  },
  resumeSnapshotUrl: {
    type: DataTypes.STRING,
    field: 'resume_snapshot_url'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'applications',
  timestamps: true,
  underscored: true
});

module.exports = Application;
