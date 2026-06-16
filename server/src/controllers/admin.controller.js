import * as service from '../services/admin.service.js';
import { ok } from '../utils/apiResponse.js';

export async function getUsers(req, res, next) {
  try {
    const items = await service.listUsers({ role: req.query.role, search: req.query.search });
    ok(res, { items, total: items.length });
  } catch (e) {
    next(e);
  }
}

export async function patchRole(req, res, next) {
  try {
    const user = await service.updateRole(req.user.id, Number(req.params.id), req.body?.role);
    ok(res, user);
  } catch (e) {
    next(e);
  }
}

export async function patchBlock(req, res, next) {
  try {
    const user = await service.setBlocked(req.user.id, Number(req.params.id), req.body?.isBlocked);
    ok(res, user);
  } catch (e) {
    next(e);
  }
}
