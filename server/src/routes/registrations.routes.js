import { Router } from 'express';
import { cancel, listMy } from '../controllers/registrations.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/my', requireAuth, requireRole('STUDENT'), listMy);
router.delete('/:id', requireAuth, requireRole('STUDENT'), cancel);

export default router;
