import * as service from '../services/events.service.js';
import { ok, ApiError } from '../utils/apiResponse.js';

export async function getEvents(req, res, next) {
  try {
    const items = await service.listEvents();
    ok(res, { items, total: items.length });
  } catch (e) {
    next(e);
  }
}

export async function getEventById(req, res, next) {
  try {
    const event = await service.getEvent(Number(req.params.id));
    if (!event) throw new ApiError(404, 'NOT_FOUND', 'Мероприятие не найдено');
    ok(res, event);
  } catch (e) {
    next(e);
  }
}
