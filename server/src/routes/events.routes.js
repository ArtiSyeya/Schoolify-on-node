import { Router } from 'express';
import { getEvents, getEventById } from '../controllers/events.controller.js';
import { register } from '../controllers/registrations.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/:id/register', requireAuth, requireRole('STUDENT'), register);

export default router;
