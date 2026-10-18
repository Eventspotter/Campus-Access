import { Router } from 'express';
import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getProfile, updateProfile, uploadAvatar, getAvatar } from '../controllers/profile.controller.js';
import { requireRole } from '../middleware/role.middleware.js';
const router = Router();
router.get('/me', requireAuth, getProfile);
router.patch('/me', requireAuth, requireRole('admin'), updateProfile);
router.post('/avatar', requireAuth, requireRole('admin'),
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: '2mb' }), uploadAvatar);
router.get('/avatar', requireAuth, getAvatar);
export default router;
