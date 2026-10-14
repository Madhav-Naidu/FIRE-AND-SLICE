import express from 'express';
import { adminLogin, getAdminProfile } from '../controllers/admin.controller.js';
import { adminMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', adminLogin);
router.get('/me', adminMiddleware, getAdminProfile);

export default router;
