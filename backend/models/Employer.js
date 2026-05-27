const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employer = sequelize.define('Employer', {
  companyName: { type: DataTypes.STRING, allowNull: false },
  companyLogo: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  website: { type: DataTypes.STRING },
  industry: { type: DataTypes.STRING },
  companySize: { type: DataTypes.STRING },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationBadge: { type: DataTypes.BOOLEAN, defaultValue: false },
  profileCompletionPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'employers',
  timestamps: true,
  underscored: true
});

module.exports = Employer;
