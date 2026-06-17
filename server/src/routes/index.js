import { Router } from 'express';
import authRoutes from './auth.routes.js';
import eventsRoutes from './events.routes.js';
import registrationsRoutes from './registrations.routes.js';
import adminRoutes from './admin.routes.js';
import notificationsRoutes from './notifications.routes.js';
import profileRoutes from './profile.routes.js';
import ratingRoutes from './rating.routes.js';
import usersRoutes from './users.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));
router.use('/auth', authRoutes);
router.use('/events', eventsRoutes);
router.use('/registrations', registrationsRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/profile', profileRoutes);
router.use('/rating', ratingRoutes);
router.use('/users', usersRoutes);

export default router;
