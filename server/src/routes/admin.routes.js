import { Router } from 'express';
import { createUser, listUsers, setActive, changeAccountPassword } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.route('/faculty').post(createUser('faculty')).get(listUsers('faculty'));
router.route('/students').post(createUser('student')).get(listUsers('student'));
router.patch('/faculty/:id/status', setActive('faculty'));
router.patch('/students/:id/status', setActive('student'));
router.post('/accounts/:id/password', changeAccountPassword);

export default router;
