import * as service from '../services/events.service.js';
import { participantsToCsv } from '../utils/csv.js';
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

export async function getMine(req, res, next) {
  try {
    const items = await service.listMine(req.user);
    ok(res, { items, total: items.length });
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const event = await service.createEvent(req.user.id, req.body || {});
    ok(res, event, 201);
  } catch (e) {
    next(e);
  }
}

export async function update(req, res, next) {
  try {
    const event = await service.updateEvent(req.user, Number(req.params.id), req.body || {});
    ok(res, event);
  } catch (e) {
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    await service.deleteEvent(req.user, Number(req.params.id));
    res.status(204).end();
  } catch (e) {
    next(e);
  }
}

export async function participants(req, res, next) {
  try {
    const items = await service.getParticipants(req.user, Number(req.params.id));
    ok(res, { items, total: items.length });
  } catch (e) {
    next(e);
  }
}

export async function exportParticipants(req, res, next) {
  try {
    const rows = await service.getParticipants(req.user, Number(req.params.id));
    const csv = participantsToCsv(rows);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="participants-${req.params.id}.csv"`);
    res.send('﻿' + csv); // BOM, чтобы Excel корректно открыл кириллицу
  } catch (e) {
    next(e);
  }
}
