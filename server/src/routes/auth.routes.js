import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { login, logout, me } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' }
}), login);

router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

export default router;
