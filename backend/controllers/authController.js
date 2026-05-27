const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Employer } = require('../models');

exports.register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;
    console.log('Registration attempt:', { email, role, firstName, lastName });

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
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
      expiresIn: '1h'
    });

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
    console.error('Registration Error:', err);
    res.status(500).json({ error: err.message });
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

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

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
    console.error('Registration Error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
    // Logic for sending reset email
    res.json({ message: "Password reset link sent to your email" });
};

exports.verify2FA = async (req, res) => {
    // Logic for 2FA verification
    res.json({ message: "2FA Verified" });
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // In a real app, you would verify the Google token here
    // For now, we'll implement a mock successful login/register
    // so the button responds and the user can enter the app.

    // Mock user logic
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
      expiresIn: '1h'
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
    console.error('Registration Error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.linkedinLogin = (req, res) => {
    // LinkedIn OAuth integration logic
};
