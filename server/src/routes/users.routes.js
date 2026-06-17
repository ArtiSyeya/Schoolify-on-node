import { Router } from 'express';
import { getPublicProfile } from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/:id', requireAuth, getPublicProfile);

export default router;
