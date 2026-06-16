import { Router } from 'express';
import { getUsers, patchRole, patchBlock } from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Весь раздел доступен только администратору.
router.use(requireAuth, requireRole('ADMIN'));

router.get('/users', getUsers);
router.patch('/users/:id/role', patchRole);
router.patch('/users/:id/block', patchBlock);

export default router;
