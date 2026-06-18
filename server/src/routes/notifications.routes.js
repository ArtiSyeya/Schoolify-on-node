import { Router } from 'express';
import { getMy, markRead } from '../controllers/notifications.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();


router.use(requireAuth);

router.get('/', getMy);
router.patch('/:id/read', markRead);

export default router;
