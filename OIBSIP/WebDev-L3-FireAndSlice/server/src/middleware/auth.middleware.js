import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import Admin from '../models/Admin.model.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fire_and_slice_jwt_secret');

    if (String(decoded.id).startsWith('mem_') || !isDbConnected()) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: 'Marco Bellini',
        email: 'demo@fireandslice.com'
      };
      return next();
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      // Fallback to decoded user
      req.user = { _id: decoded.id, id: decoded.id, name: 'Patron' };
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      // In dev mode allow kitchen ops access or require token
      return res.status(401).json({ message: 'No admin token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fire_and_slice_jwt_secret');

    if (String(decoded.id).startsWith('mem_') || !isDbConnected()) {
      req.admin = {
        _id: decoded.id,
        id: decoded.id,
        username: 'admin',
        email: 'admin@fireandslice.com',
        role: 'superadmin'
      };
      return next();
    }

    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      req.admin = { _id: decoded.id, id: decoded.id, username: 'admin', role: 'superadmin' };
      return next();
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid admin token' });
  }
};
