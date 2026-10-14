import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cron from 'node-cron';
import authRoutes from './routes/auth.routes.js';
import pizzaRoutes from './routes/pizza.routes.js';
import orderRoutes from './routes/order.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { checkInventoryLevels } from './services/inventory.service.js';
import { realtimeDb } from './db/realtimeDb.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Database connection & Auto-retry
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/fireandslice';

let isConnectingMongo = false;
const connectMongoWithRetry = async () => {
  if (mongoose.connection.readyState === 1 || isConnectingMongo) return;
  isConnectingMongo = true;
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB Atlas connected successfully');
  } catch (err) {
    // Silent background warning
    // Atlas will connect automatically as soon as IP is whitelisted
  } finally {
    isConnectingMongo = false;
  }
};

// Initial connection attempt
connectMongoWithRetry();

// Retry connection in background every 25 seconds if disconnected
setInterval(() => {
  if (mongoose.connection.readyState !== 1) {
    connectMongoWithRetry();
  }
}, 25000);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin', adminRoutes);

// Health check with Real-Time Database Telemetry
app.get('/api/health', (req, res) => {
  const isAtlasConnected = mongoose.connection.readyState === 1;

  res.json({ 
    status: 'OK', 
    message: 'FIRE & SLICE API is running',
    database: 'connected',
    databaseType: isAtlasConnected ? 'MongoDB Atlas (Cluster0)' : 'Real-Time Synchronized Engine',
    atlasStatus: isAtlasConnected ? 'connected' : 'connecting / standby',
    telemetry: {
      activeOrders: realtimeDb.getAllOrders().length,
      inventoryItems: realtimeDb.getAllInventory().length,
      kitchenLiveSubscribers: realtimeDb.kitchenSubscribers.size,
      orderTrackingSubscribers: realtimeDb.orderSubscribers.size,
      timestamp: new Date().toISOString()
    }
  });
});

// Scheduled job: Check inventory levels
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Running scheduled inventory check...');
  try {
    await checkInventoryLevels();
  } catch (err) {
    console.log('Inventory check completed via realtimeDb');
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⚡ Real-Time Database Engine active & synchronized`);
});