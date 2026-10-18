import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { login, logout, me, setupMfa, confirmMfa, disableMfa } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requestReset, resetPassword } from '../controllers/recovery.controller.js';
const router = Router();
router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30,
  skipSuccessfulRequests: true, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' } }), login);
router.post('/password/request', rateLimit({ windowMs: 15 * 60 * 1000, limit: 5,
  standardHeaders: 'draft-8', legacyHeaders: false }), requestReset);
router.post('/password/reset', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10,
  standardHeaders: 'draft-8', legacyHeaders: false }), resetPassword);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);
const mfaLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10,
  standardHeaders: 'draft-8', legacyHeaders: false,
  message: { message: 'Too many verification attempts. Try again in 15 minutes.' } });
router.post('/mfa/setup', mfaLimit, requireAuth, setupMfa);
router.post('/mfa/confirm', mfaLimit, requireAuth, confirmMfa);
router.post('/mfa/disable', mfaLimit, requireAuth, disableMfa);
export default router;
