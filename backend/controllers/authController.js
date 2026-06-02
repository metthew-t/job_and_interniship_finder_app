const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Employer } = require('../models');

exports.register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;
    console.log(`[AUTH] Registration attempt: ${email} as ${role}`);

    if (!email || !password || !role) {
       return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log(`[AUTH] Registration failed: User ${email} already exists`);
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      role,
      firstName,
      lastName
    });

    // Create Employer profile if role is employer
    if (role === 'employer') {
      await Employer.create({
        userId: user.id,
        companyName: `${firstName}'s Company` // Default name
      });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    console.log(`[AUTH] User ${user.id} registered successfully`);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    console.error('[AUTH] CRITICAL REGISTRATION ERROR:', err);
    res.status(500).json({ message: 'Internal server error during registration', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'role', 'firstName', 'lastName']
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt: ${email}`);

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`[AUTH] Login failed: User ${email} not found`);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.log(`[AUTH] Login failed: Incorrect password for ${email}`);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    console.log(`[AUTH] User ${user.id} logged in successfully`);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    console.error('[AUTH] CRITICAL LOGIN ERROR:', err);
    res.status(500).json({ message: 'Internal server error during login', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
    res.json({ message: "Password reset link sent to your email" });
};

exports.verify2FA = async (req, res) => {
    res.json({ message: "2FA Verified" });
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    let user = await User.findOne({ where: { email: 'google-user@example.com' } });
    if (!user) {
      user = await User.create({
        email: 'google-user@example.com',
        role: 'student',
        firstName: 'Google',
        lastName: 'User',
        isVerified: true
      });
    }

    const jwtToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.linkedinLogin = (req, res) => {
};
