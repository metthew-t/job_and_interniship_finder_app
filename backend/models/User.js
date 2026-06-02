const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, field: 'password_hash' },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'student' },
  firstName: { type: DataTypes.STRING, field: 'first_name' },
  lastName: { type: DataTypes.STRING, field: 'last_name' },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_verified' }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true
});

module.exports = User;
