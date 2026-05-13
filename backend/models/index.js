const sequelize = require('../config/database');
const User = require('./User');
const Employer = require('./Employer');
const Job = require('./Job');
const Profile = require('./Profile');
const Application = require('./Application');

// User & Profile
User.hasOne(Profile, { foreignKey: 'userId', as: 'profile' });
Profile.belongsTo(User, { foreignKey: 'userId' });

// User & Employer
User.hasOne(Employer, { foreignKey: 'userId', as: 'employerProfile' });
Employer.belongsTo(User, { foreignKey: 'userId' });

// Employer & Job
Employer.hasMany(Job, { foreignKey: 'employerId' });
Job.belongsTo(Employer, { foreignKey: 'employerId' });

// Job & Application
Job.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

// User & Application
User.hasMany(Application, { foreignKey: 'userId' });
Application.belongsTo(User, { foreignKey: 'userId' });

// Note: Skills, Experience, Education would follow similar patterns

const db = {
  sequelize,
  User,
  Employer,
  Job,
  Profile,
  Application
};

module.exports = db;
