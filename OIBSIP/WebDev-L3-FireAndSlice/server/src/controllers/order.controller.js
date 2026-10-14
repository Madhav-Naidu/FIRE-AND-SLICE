import Order from '../models/Order.model.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { realtimeDb } from '../db/realtimeDb.js';

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

const isDbConnected = () => mongoose.connection.readyState === 1;

// @route   POST /api/orders
// @desc    Direct Real-Time Order Placement
// @access  Public or Authenticated
export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData) {
      return res.status(400).json({ message: 'Order data required' });
    }

    // Always create in Realtime DB immediately for zero latency
    const order = realtimeDb.createOrder(orderData, req.user);

    // If MongoDB Atlas is connected, also persist to Mongo
    if (isDbConnected()) {
      try {
        await Order.create({
          userId: req.user?._id || new mongoose.Types.ObjectId(),
          orderNumber: order.orderNumber,
          pizza: order.pizza || {
            base: '72h Neapolitan Biga',
            sauce: 'San Marzano DOP',
            cheese: 'Fior di Latte Mozzarella',
            vegetables: []
          },
          totalPrice: order.totalPrice,
          paymentId: order.paymentMethod || 'DIRECT_PAY',
          paymentStatus: 'completed',
          status: 'In Kitchen'
        });
      } catch (mongoErr) {
        console.warn('MongoDB dual-write sync:', mongoErr.message);
      }
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// @route   POST /api/orders/create-order
// @desc    Create Razorpay order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!razorpay) {
      // Mock order if gateway key is test/demo
      return res.json({
        orderId: `order_mock_${Date.now()}`,
        amount: (amount || 500) * 100,
        currency: 'INR'
      });
    }

    const options = {
      amount: (amount || 500) * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ message: 'Error creating payment order' });
  }
};

// @route   POST /api/orders/verify-payment
// @desc    Verify Razorpay payment and create order
// @access  Private
export const verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      pizza,
      totalPrice
    } = req.body;

    // Verify signature if live razorpay secret configured
    if (razorpay && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET !== 'demo_secret') {
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');

      if (razorpay_signature !== expectedSign) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }
    }

    const order = realtimeDb.createOrder({
      items,
      pizza,
      totalPrice,
      paymentId: razorpay_payment_id || `pay_${Date.now()}`,
      paymentMethod: 'Razorpay / Instant UPI'
    }, req.user);

    res.status(201).json({
      message: 'Payment confirmed & order queued in kiln',
      order
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Error processing order' });
  }
};

// @route   GET /api/orders/user
// @desc    Get user's orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const orders = realtimeDb.getUserOrders(userId);
    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Public / Private
export const getOrder = async (req, res) => {
  try {
    const order = realtimeDb.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

// @route   GET /api/orders
// @desc    Get all orders (Admin Kitchen View)
// @access  Public / Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = realtimeDb.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin / Kitchen Ops)
// @access  Public / Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status required' });
    }

    const order = realtimeDb.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully in real time',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
};

// @route   GET /api/orders/live-stream
// @desc    Server-Sent Events (SSE) Live Feed for Kitchen Ops (Admin Portal)
// @access  Public
export const liveKitchenStream = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`);

  realtimeDb.registerKitchenSubscriber(res);
};

// @route   GET /api/orders/:id/live
// @desc    Server-Sent Events (SSE) Live Feed for Customer Order Tracking
// @access  Public
export const liveOrderStream = (req, res) => {
  const { id } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const current = realtimeDb.getOrderById(id);
  if (current) {
    res.write(`data: ${JSON.stringify(current)}\n\n`);
  } else {
    res.write(`data: ${JSON.stringify({ status: 'Order Received', _id: id })}\n\n`);
  }

  realtimeDb.registerOrderSubscriber(id, res);
};
