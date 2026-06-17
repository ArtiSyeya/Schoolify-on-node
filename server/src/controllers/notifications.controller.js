import * as service from '../services/notifications.service.js';
import { ok } from '../utils/apiResponse.js';

export async function getMy(req, res, next) {
  try {
    const items = await service.listMy(req.user.id);
    const unread = items.filter((n) => !n.isRead).length;
    ok(res, { items, total: items.length, unread });
  } catch (e) {
    next(e);
  }
}

export async function markRead(req, res, next) {
  try {
    const n = await service.markRead(req.user.id, Number(req.params.id));
    ok(res, { id: n.id, isRead: n.isRead });
  } catch (e) {
    next(e);
  }
}
