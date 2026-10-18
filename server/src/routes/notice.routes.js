import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { listNotices, markNoticeRead, summary } from '../controllers/notice.controller.js';
const router = Router();
router.use(requireAuth);
router.get('/', listNotices);
router.patch('/:id/read', markNoticeRead);
router.get('/summary/me', summary);
export default router;
