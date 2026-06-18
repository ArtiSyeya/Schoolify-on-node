import { Router } from 'express';
import {
  getEvents,
  getEventById,
  getMine,
  create,
  update,
  remove,
  participants,
  exportParticipants,
  setAttendance,
} from '../controllers/events.controller.js';
import { register } from '../controllers/registrations.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
const organizer = [requireAuth, requireRole('ORGANIZER', 'ADMIN')];


router.get('/', getEvents);
router.get('/mine', ...organizer, getMine);
router.post('/', ...organizer, create);

router.get('/:id', getEventById);
router.put('/:id', ...organizer, update);
router.delete('/:id', ...organizer, remove);

router.get('/:id/participants', ...organizer, participants);
router.get('/:id/participants/export', ...organizer, exportParticipants);
router.patch('/:id/participants/:registrationId', ...organizer, setAttendance);

router.post('/:id/register', requireAuth, requireRole('STUDENT'), register);

export default router;
