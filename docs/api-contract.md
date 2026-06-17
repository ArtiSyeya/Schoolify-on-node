# API-контракт «Schoolify»

REST API, формат — JSON, базовый префикс — **`/api/v1`**.
Авторизация — JWT в заголовке: `Authorization: Bearer <token>`.

Платформа волонтёрской программы: события (мероприятия) по категориям, запись с
начислением очков, геймификация (уровни, бейджи) и рейтинг волонтёров.

## Общие правила

### Формат ответа
Успех:
```json
{ "success": true, "data": { } }
```
Ошибка:
```json
{ "success": false, "error": { "code": "EVENT_FULL", "message": "На мероприятии закончились места" } }
```

### Коды состояния HTTP
| Код | Когда |
|---|---|
| 200 OK | Успешное чтение/обновление |
| 201 Created | Ресурс создан |
| 204 No Content | Успешное удаление |
| 400 Bad Request | Ошибка валидации входных данных |
| 401 Unauthorized | Нет/недействительный токен |
| 403 Forbidden | Нет прав (роль не подходит) |
| 404 Not Found | Ресурс не найден |
| 409 Conflict | Конфликт (мест нет / уже записан / email занят) |
| 500 Internal Server Error | Ошибка сервера |

### Коды ошибок приложения (`error.code`)
| code | HTTP | Описание |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Некорректные поля запроса |
| `INVALID_CREDENTIALS` | 401 | Неверный логин или пароль |
| `UNAUTHORIZED` | 401 | Требуется авторизация |
| `USER_BLOCKED` | 403 | Пользователь заблокирован |
| `FORBIDDEN` | 403 | Недостаточно прав |
| `NOT_FOUND` | 404 | Ресурс не найден |
| `EMAIL_TAKEN` | 409 | Email уже зарегистрирован |
| `EVENT_FULL` | 409 | Нет свободных мест |
| `ALREADY_REGISTERED` | 409 | Уже записан на мероприятие |
| `SERVER_ERROR` | 500 | Внутренняя ошибка |

### Справочники
- **Роли:** `GUEST` (без токена) · `STUDENT` (волонтёр) · `ORGANIZER` · `ADMIN`
- **Категории событий:** `ECO` (Эко) · `HELP` (Помощь) · `EDU` (Обучение) · `SPORT` (Спорт)
- **Статус события:** `DRAFT` · `PUBLISHED` · `CANCELLED`
- **Статус регистрации:** `ACTIVE` · `CANCELLED`
- **Уровни (по очкам):** Новичок 0 · Участник 500 · Активист 1000 · Лидер 2000 · Легенда 3000 · Чемпион 5000

---

## 1. Auth — `/api/v1/auth`

### POST `/auth/register` — регистрация
Доступ: все. Роль нового пользователя — всегда `STUDENT`.
```json
// Запрос (phone — необязательный)
{ "fullName": "Иван Петров", "email": "ivan@mail.ru", "password": "secret123", "phone": "+7 900 000-00-00" }
```
```json
// 201 Created
{ "success": true, "data": {
  "token": "eyJhbGci...",
  "user": { "id": 1, "fullName": "Иван Петров", "email": "ivan@mail.ru", "role": "STUDENT" }
}}
```
Ошибки: `400 VALIDATION_ERROR` (пустые поля, кривой email, пароль < 6), `409 EMAIL_TAKEN`.

### POST `/auth/login` — вход
Доступ: все.
```json
// Запрос
{ "email": "ivan@mail.ru", "password": "secret123" }
```
```json
// 200 OK
{ "success": true, "data": {
  "token": "eyJhbGci...",
  "user": { "id": 1, "fullName": "Иван Петров", "email": "ivan@mail.ru", "role": "STUDENT" }
}}
```
Ошибки: `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `403 USER_BLOCKED`.

### GET `/auth/me` — текущий пользователь
Доступ: авторизованный.
```json
// 200 OK
{ "success": true, "data": { "id": 1, "fullName": "Иван Петров", "email": "ivan@mail.ru", "role": "STUDENT" } }
```
Ошибки: `401 UNAUTHORIZED`.

---

## 2. Events — `/api/v1/events`

### GET `/events` — список событий
Доступ: все. Возвращает только `PUBLISHED`.
Query: `?category=ECO&search=парк&sort=points` (всё опционально; `sort=points` —
по убыванию очков, иначе по дате).
```json
// 200 OK
{ "success": true, "data": {
  "items": [
    {
      "id": 5, "title": "Очистка парка Победы", "organization": "Чистый город",
      "category": "ECO", "points": 120,
      "startsAt": "2026-06-14T07:00:00.000Z", "endsAt": "2026-06-14T11:00:00.000Z",
      "capacity": 12, "status": "PUBLISHED", "registeredCount": 3, "freeSeats": 9
    }
  ],
  "total": 1
}}
```

### GET `/events/:id` — детали события
Доступ: все.
```json
// 200 OK
{ "success": true, "data": {
  "id": 5, "title": "Очистка парка Победы", "description": "…",
  "organization": "Чистый город", "category": "ECO", "points": 120,
  "location": "Чистый город",
  "startsAt": "2026-06-14T07:00:00.000Z", "endsAt": "2026-06-14T11:00:00.000Z",
  "capacity": 12, "status": "PUBLISHED", "registeredCount": 3, "freeSeats": 9,
  "organizer": { "id": 3, "fullName": "Анна Смирнова" }
}}
```
Ошибки: `404 NOT_FOUND`.

### POST `/events` — создать событие
Доступ: `ORGANIZER`, `ADMIN`.
```json
// Запрос
{ "title": "Очистка парка", "organization": "Чистый город", "category": "ECO",
  "points": 120, "description": "…", "startsAt": "2026-07-01T10:00:00Z",
  "endsAt": "2026-07-01T14:00:00Z", "capacity": 100 }
```
```json
// 201 Created
{ "success": true, "data": { "id": 5, "status": "DRAFT", "category": "ECO", "points": 120 } }
```
Ошибки: `400 VALIDATION_ERROR` (пустой title, кривая дата, недопустимая категория,
points/capacity < 0), `401`, `403 FORBIDDEN`.

### PUT `/events/:id` — редактировать
Доступ: `ORGANIZER` (только своё), `ADMIN`. Любые изменяемые поля (частичное обновление).
```json
// Запрос
{ "status": "PUBLISHED", "points": 140, "category": "HELP" }
```
```json
// 200 OK — обновлённое событие (формат как в GET /events/:id)
{ "success": true, "data": { "id": 5, "status": "PUBLISHED", "points": 140 } }
```
Ошибки: `400`, `401`, `403 FORBIDDEN` (чужое), `404 NOT_FOUND`.

### DELETE `/events/:id` — удалить
Доступ: `ORGANIZER` (только своё), `ADMIN`. Каскадно удаляет регистрации и уведомления.
```
// 204 No Content
```
Ошибки: `401`, `403`, `404`.

### GET `/events/:id/participants` — участники
Доступ: `ORGANIZER` (только своё), `ADMIN`.
```json
// 200 OK
{ "success": true, "data": {
  "items": [
    { "registrationId": 11, "user": { "id": 1, "fullName": "Иван Петров", "email": "ivan@mail.ru" },
      "status": "ACTIVE", "createdAt": "2026-06-10T12:00:00Z" }
  ],
  "total": 1
}}
```
Ошибки: `401`, `403`, `404`.

### GET `/events/:id/participants/export` — экспорт CSV
Доступ: `ORGANIZER` (только своё), `ADMIN`. Ответ: `text/csv` (UTF-8 + BOM).
```
fullName,email,status,createdAt
Иван Петров,ivan@mail.ru,ACTIVE,2026-06-10T12:00:00.000Z
```

---

## 3. Registrations — `/api/v1/registrations`

### POST `/events/:id/register` — записаться
Доступ: `STUDENT`. Запись начисляет очки/часы события в геймификацию.
```json
// 201 Created
{ "success": true, "data": { "id": 11, "eventId": 5, "userId": 1, "status": "ACTIVE" } }
```
Ошибки: `401`, `403 FORBIDDEN`, `404 NOT_FOUND`, `409 EVENT_FULL`, `409 ALREADY_REGISTERED`.

### GET `/registrations/my` — мои регистрации
Доступ: `STUDENT`.
```json
// 200 OK
{ "success": true, "data": {
  "items": [
    { "id": 11, "status": "ACTIVE",
      "event": { "id": 5, "title": "Очистка парка Победы", "startsAt": "…", "location": "…" } }
  ],
  "total": 1
}}
```
Ошибки: `401`.

### DELETE `/registrations/:id` — отменить
Доступ: `STUDENT` (только свою). Ставит `status = CANCELLED`, очки/часы откатываются.
```
// 204 No Content
```
Ошибки: `401`, `403` (чужая), `404`.

---

## 4. Profile — `/api/v1/profile`

### GET `/profile` — мой профиль + геймификация
Доступ: авторизованный. `rank` заполняется только для роли `STUDENT`.
```json
// 200 OK
{ "success": true, "data": {
  "id": 1, "fullName": "Алина Смирнова", "email": "alina@schoolify.ru",
  "phone": "+7 900 111-22-33", "role": "STUDENT",
  "points": 650, "hours": 23, "eventsCount": 5, "rank": 1,
  "level": "Участник", "levelKey": "MEMBER",
  "nextLevel": "Активист", "currentThreshold": 500, "nextThreshold": 1000, "toNextLevel": 350,
  "badges": [
    { "key": "NEWBIE", "name": "Новичок", "earned": true },
    { "key": "MEMBER", "name": "Участник", "earned": true },
    { "key": "ACTIVIST", "name": "Активист", "earned": false }
  ],
  "memberSince": "2026-06-01T00:00:00.000Z",
  "recentActivity": [
    { "id": 11, "eventId": 5, "title": "Очистка парка Победы", "points": 120, "date": "…" }
  ]
}}
```
Ошибки: `401`, `404`.

### PATCH `/profile` — изменить профиль
Доступ: авторизованный. Меняет `fullName` и/или `phone`.
```json
// Запрос
{ "fullName": "Алина Смирнова", "phone": "+7 999 123-45-67" }
```
```json
// 200 OK
{ "success": true, "data": { "id": 1, "fullName": "Алина Смирнова", "email": "…", "phone": "+7 999 123-45-67", "role": "STUDENT" } }
```
Ошибки: `400 VALIDATION_ERROR` (пустое имя), `401`.

### GET `/users/:id` — публичный профиль другого пользователя
Доступ: авторизованный. То же, что `GET /profile`, но **без `email` и `phone`**
(приватность) и без редактирования. Используется при переходе на профиль из рейтинга.
```json
// 200 OK
{ "success": true, "data": {
  "id": 2, "fullName": "Марина Кузнецова", "role": "STUDENT",
  "points": 570, "hours": 24, "eventsCount": 5, "rank": 2,
  "level": "Участник", "nextLevel": "Активист", "nextThreshold": 1000, "toNextLevel": 430,
  "badges": [ { "key": "NEWBIE", "name": "Новичок", "earned": true } ],
  "memberSince": "2026-06-01T00:00:00.000Z",
  "recentActivity": [ { "id": 9, "eventId": 4, "title": "Мастеркласс по рисованию", "points": 60, "date": "…" } ]
}}
```
Ошибки: `401 UNAUTHORIZED`, `404 NOT_FOUND`.

---

## 5. Rating — `/api/v1/rating`

### GET `/rating` — рейтинг волонтёров
Доступ: авторизованный. Считается из регистраций (роль `STUDENT`).
Query: `?period=week|month|all` (по умолчанию `all`). `me` — место текущего пользователя.
```json
// 200 OK
{ "success": true, "data": {
  "period": "all",
  "items": [
    { "rank": 1, "userId": 1, "fullName": "Алина Смирнова", "points": 650, "hours": 23, "eventsCount": 5 },
    { "rank": 2, "userId": 2, "fullName": "Марина Кузнецова", "points": 570, "hours": 24, "eventsCount": 5 }
  ],
  "me": { "rank": 1, "userId": 1, "fullName": "Алина Смирнова", "points": 650, "hours": 23, "eventsCount": 5 }
}}
```
Ошибки: `401`.

---

## 6. Admin / Users — `/api/v1/admin`

### GET `/admin/users` — список пользователей
Доступ: `ADMIN`. Query: `?role=STUDENT&search=иван`.
```json
// 200 OK
{ "success": true, "data": {
  "items": [ { "id": 1, "fullName": "Иван Петров", "email": "ivan@mail.ru", "role": "STUDENT", "isBlocked": false } ],
  "total": 1
}}
```
Ошибки: `401`, `403`.

### PATCH `/admin/users/:id/role` — изменить роль
Доступ: `ADMIN`. Роль из `STUDENT|ORGANIZER|ADMIN`. Нельзя менять свою.
```json
// Запрос → 200 OK
{ "role": "ORGANIZER" }
```
Ошибки: `400 VALIDATION_ERROR`, `401`, `403`, `404`.

### PATCH `/admin/users/:id/block` — блокировка / разблокировка
Доступ: `ADMIN`. Нельзя заблокировать себя.
```json
// Запрос → 200 OK
{ "isBlocked": true }
```
Ошибки: `400`, `401`, `403`, `404`.

---

## 7. Notifications — `/api/v1/notifications`

### GET `/notifications` — мои уведомления
Доступ: авторизованный. `unread` — счётчик непрочитанных (для бейджа).
```json
// 200 OK
{ "success": true, "data": {
  "items": [
    { "id": 7, "message": "Вы зарегистрированы на «Очистка парка Победы»", "isRead": false, "eventId": 5, "createdAt": "…" }
  ],
  "total": 1, "unread": 1
}}
```
Ошибки: `401`.

### PATCH `/notifications/:id/read` — отметить прочитанным
Доступ: авторизованный (только своё).
```json
// 200 OK
{ "success": true, "data": { "id": 7, "isRead": true } }
```
Ошибки: `401`, `403`, `404`.

---

## Сводная таблица эндпоинтов

| Метод | Путь | Роль | Назначение |
|---|---|---|---|
| POST | `/auth/register` | все | Регистрация (+ phone) |
| POST | `/auth/login` | все | Вход, JWT |
| GET | `/auth/me` | auth | Текущий пользователь |
| GET | `/events` | все | Список (фильтр `category/search/sort`) |
| GET | `/events/:id` | все | Детали события |
| POST | `/events` | ORGANIZER, ADMIN | Создать |
| PUT | `/events/:id` | ORGANIZER(своё), ADMIN | Редактировать |
| DELETE | `/events/:id` | ORGANIZER(своё), ADMIN | Удалить |
| GET | `/events/:id/participants` | ORGANIZER(своё), ADMIN | Участники |
| GET | `/events/:id/participants/export` | ORGANIZER(своё), ADMIN | Экспорт CSV |
| POST | `/events/:id/register` | STUDENT | Записаться |
| GET | `/registrations/my` | STUDENT | Мои регистрации |
| DELETE | `/registrations/:id` | STUDENT(своё) | Отменить |
| GET | `/profile` | auth | Профиль + геймификация |
| PATCH | `/profile` | auth | Изменить имя/телефон |
| GET | `/users/:id` | auth | Публичный профиль (без email/phone) |
| GET | `/rating` | auth | Рейтинг волонтёров (`period`) |
| GET | `/admin/users` | ADMIN | Пользователи |
| PATCH | `/admin/users/:id/role` | ADMIN | Сменить роль |
| PATCH | `/admin/users/:id/block` | ADMIN | Блокировка |
| GET | `/notifications` | auth | Уведомления (+ `unread`) |
| PATCH | `/notifications/:id/read` | auth | Отметить прочитанным |
