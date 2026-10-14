import express from 'express';
import {
  createOrder,
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
  getUserOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  liveKitchenStream,
  liveOrderStream
} from '../controllers/order.controller.js';

const router = express.Router();

// Real-Time Server-Sent Events (SSE) Streams
router.get('/live-stream', liveKitchenStream);
router.get('/:id/live', liveOrderStream);

// Order Placement & Fetching
router.post('/', createOrder);
router.post('/create-order', createRazorpayOrder);
router.post('/verify-payment', verifyPaymentAndCreateOrder);
router.get('/user', getUserOrders);
router.get('/:id', getOrder);

// Admin / Kitchen Operations
router.get('/', getAllOrders);
router.put('/:id/status', updateOrderStatus);

export default router;
