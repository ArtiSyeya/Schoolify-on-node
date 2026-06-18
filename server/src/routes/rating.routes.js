import { Router } from 'express';
import { getRating } from '../controllers/rating.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getRating);

export default router;
