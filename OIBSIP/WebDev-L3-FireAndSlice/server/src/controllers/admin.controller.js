import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Admin from '../models/Admin.model.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fire_and_slice_jwt_secret', {
    expiresIn: '30d'
  });
};

const isDbConnected = () => mongoose.connection.readyState === 1;

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    if (!isDbConnected()) {
      if (
        (username === 'admin' || username === 'admin@fireandslice.com') &&
        (password === 'admin123' || password === 'password123')
      ) {
        const token = generateToken('mem_admin_01');
        return res.json({
          token,
          admin: {
            id: 'mem_admin_01',
            username: 'admin',
            email: 'admin@fireandslice.com',
            role: 'superadmin'
          }
        });
      }
      return res.status(401).json({ message: 'Invalid credentials. Default: admin / admin123' });
    }

    // Normal MongoDB flow
    const admin = await Admin.findOne({ 
      $or: [{ username }, { email: username }] 
    });
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(admin._id);

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

// @route   GET /api/admin/me
// @desc    Get current admin
// @access  Private (Admin)
export const getAdminProfile = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        id: 'mem_admin_01',
        username: 'admin',
        email: 'admin@fireandslice.com',
        role: 'superadmin'
      });
    }

    const admin = await Admin.findById(req.admin.id).select('-password');
    res.json(admin);
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Server error fetching admin data' });
  }
};
