import * as service from '../services/registrations.service.js';
import { ok } from '../utils/apiResponse.js';

export async function register(req, res, next) {
  try {
    const registration = await service.register(req.user.id, Number(req.params.id));
    ok(res, registration, 201);
  } catch (e) {
    next(e);
  }
}

export async function cancel(req, res, next) {
  try {
    await service.cancel(req.user.id, Number(req.params.id));
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

export async function listMy(req, res, next) {
  try {
    const items = await service.listMy(req.user.id);
    ok(res, { items, total: items.length });
  } catch (e) {
    next(e);
  }
}
