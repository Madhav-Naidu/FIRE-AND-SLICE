import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.model.js';
import Inventory from './models/Inventory.model.js';
import User from './models/User.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fireandslice';

const inventoryData = [
  // Bases
  { category: 'base', name: 'Thin Crust', stock: 100, unit: 'units', threshold: 20, price: 50 },
  { category: 'base', name: 'Regular Crust', stock: 100, unit: 'units', threshold: 20, price: 60 },
  { category: 'base', name: 'Thick Crust', stock: 80, unit: 'units', threshold: 20, price: 70 },
  { category: 'base', name: 'Cheese Burst', stock: 50, unit: 'units', threshold: 15, price: 100 },
  { category: 'base', name: 'Wheat Crust', stock: 60, unit: 'units', threshold: 20, price: 80 },
  
  // Sauces
  { category: 'sauce', name: 'Marinara', stock: 100, unit: 'units', threshold: 20, price: 20 },
  { category: 'sauce', name: 'Pesto', stock: 80, unit: 'units', threshold: 20, price: 30 },
  { category: 'sauce', name: 'BBQ', stock: 70, unit: 'units', threshold: 20, price: 25 },
  { category: 'sauce', name: 'Alfredo', stock: 60, unit: 'units', threshold: 15, price: 35 },
  { category: 'sauce', name: 'Spicy Red', stock: 75, unit: 'units', threshold: 20, price: 25 },
  
  // Cheeses
  { category: 'cheese', name: 'Mozzarella', stock: 100, unit: 'units', threshold: 20, price: 40 },
  { category: 'cheese', name: 'Cheddar', stock: 80, unit: 'units', threshold: 20, price: 45 },
  { category: 'cheese', name: 'Parmesan', stock: 60, unit: 'units', threshold: 15, price: 50 },
  { category: 'cheese', name: 'Vegan Cheese', stock: 40, unit: 'units', threshold: 10, price: 60 },
  
  // Vegetables
  { category: 'vegetable', name: 'Onions', stock: 100, unit: 'units', threshold: 30, price: 10 },
  { category: 'vegetable', name: 'Tomatoes', stock: 100, unit: 'units', threshold: 30, price: 10 },
  { category: 'vegetable', name: 'Bell Peppers', stock: 80, unit: 'units', threshold: 25, price: 15 },
  { category: 'vegetable', name: 'Mushrooms', stock: 70, unit: 'units', threshold: 20, price: 20 },
  { category: 'vegetable', name: 'Olives', stock: 60, unit: 'units', threshold: 20, price: 15 },
  { category: 'vegetable', name: 'Jalapeños', stock: 50, unit: 'units', threshold: 15, price: 15 },
  { category: 'vegetable', name: 'Corn', stock: 80, unit: 'units', threshold: 25, price: 10 },
  { category: 'vegetable', name: 'Spinach', stock: 50, unit: 'units', threshold: 20, price: 15 },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Admin.deleteMany({});
    await Inventory.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await Admin.create({
      username: 'admin',
      email: 'admin@fireandslice.com',
      password: hashedPassword,
      role: 'superadmin',
    });
    console.log('👤 Created admin user (admin / admin123)');

    // Create demo customer user
    await User.create({
      name: 'Marco Bellini',
      email: 'demo@fireandslice.com',
      password: 'password123',
      isVerified: true,
    });
    console.log('👤 Created demo patron user (demo@fireandslice.com / password123)');

    // Create inventory items
    for (const item of inventoryData) {
      await Inventory.create(item);
    }
    console.log(`📦 Created ${inventoryData.length} inventory items`);

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();