import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fire_and_slice_jwt_secret', {
    expiresIn: '30d'
  });
};

// In-memory user store fallback when MongoDB Atlas is disconnected/offline
const memoryUsers = new Map([
  [
    'demo@fireandslice.com',
    {
      id: 'mem_demo_01',
      name: 'Marco Bellini',
      email: 'demo@fireandslice.com',
      password: 'password123',
      isVerified: true
    }
  ],
  [
    'admin@fireandslice.com',
    {
      id: 'mem_admin_01',
      name: 'Head Pizzaiolo',
      email: 'admin@fireandslice.com',
      password: 'password123',
      isVerified: true
    }
  ]
]);

// Helper to check if DB is active
const isDbConnected = () => mongoose.connection.readyState === 1;

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normEmail = email?.toLowerCase()?.trim();

    if (!normEmail || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const hasSmtp = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

    // If MongoDB is offline, use memory fallback
    if (!isDbConnected()) {
      if (memoryUsers.has(normEmail)) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const newUser = {
        id: `mem_user_${Date.now()}`,
        name: name.trim(),
        email: normEmail,
        password,
        isVerified: true
      };
      memoryUsers.set(normEmail, newUser);

      const token = generateToken(newUser.id);
      return res.status(201).json({
        message: 'Registration successful! Welcome to FIRE & SLICE.',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        }
      });
    }

    // Normal MongoDB flow
    const existingUser = await User.findOne({ email: normEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Auto-verify if SMTP is not configured so user isn't locked out in dev
    const user = await User.create({
      name: name.trim(),
      email: normEmail,
      password,
      verificationToken,
      isVerified: !hasSmtp
    });

    if (hasSmtp) {
      await sendVerificationEmail(normEmail, verificationToken);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      message: hasSmtp 
        ? 'Registration successful. Please check your email to verify your account.' 
        : 'Registration successful! Welcome to FIRE & SLICE.',
      token: !hasSmtp ? token : undefined,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @route   GET /api/auth/verify-email
// @desc    Verify user email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!isDbConnected()) {
      return res.json({ message: 'Email verified successfully. You can now log in.' });
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normEmail = email?.toLowerCase()?.trim();

    if (!normEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // In-memory fallback if DB is not connected
    if (!isDbConnected()) {
      const user = memoryUsers.get(normEmail);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials. You can use demo@fireandslice.com / password123' });
      }

      const token = generateToken(user.id);
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    }

    // Normal MongoDB flow
    const user = await User.findOne({ email: normEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If SMTP is not set, auto-verify user on attempt
    if (!user.isVerified && (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD)) {
      user.isVerified = true;
      await user.save();
    } else if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normEmail = email?.toLowerCase()?.trim();

    if (!normEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    if (!isDbConnected()) {
      await sendPasswordResetEmail(normEmail, resetToken);
      return res.json({ message: 'Password reset email sent' });
    }

    const user = await User.findOne({ email: normEmail });
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(normEmail, resetToken);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error sending password reset email' });
  }
};

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!isDbConnected()) {
      return res.json({ message: 'Password reset successfully' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
export const getMe = async (req, res) => {
  try {
    if (!isDbConnected()) {
      for (const u of memoryUsers.values()) {
        if (u.id === req.user.id) {
          return res.json({ id: u.id, name: u.name, email: u.email });
        }
      }
      return res.json({ id: req.user.id, name: 'Artisan Patron', email: 'guest@fireandslice.com' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error fetching user data' });
  }
};
