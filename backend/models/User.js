const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'student' },
  firstName: { type: DataTypes.STRING },
  lastName: { type: DataTypes.STRING },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true // This converts firstName -> first_name in DB
});

module.exports = User;
