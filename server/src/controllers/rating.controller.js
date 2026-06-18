import * as gamification from '../services/gamification.service.js';
import { ok } from '../utils/apiResponse.js';

const PERIODS = ['week', 'month', 'all'];

export async function getRating(req, res, next) {
  try {
    const period = PERIODS.includes(req.query.period) ? req.query.period : 'all';
    const items = await gamification.leaderboard(period);
    const me = items.find((i) => i.userId === req.user.id) || null;
    ok(res, { period, items, me });
  } catch (e) {
    next(e);
  }
}
