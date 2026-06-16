# API-контракт «Schoolify»

REST API, формат — JSON, базовый префикс — **`/api/v1`**.
Авторизация — JWT в заголовке: `Authorization: Bearer <token>`.

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

### Роли
`GUEST` (без токена) · `STUDENT` · `ORGANIZER` · `ADMIN`

---

## 1. Auth — `/api/v1/auth`

### POST `/auth/register` — регистрация
Доступ: все.
```json
// Запрос
{ "fullName": "Иван Петров", "email": "ivan@mail.ru", "password": "secret123" }
```
```json
// 201 Created
{ "success": true, "data": {
  "token": "eyJhbGci...",
  "user": { "id": 1, "fullName": "Иван Петров", "email": "ivan@mail.ru", "role": "STUDENT" }
}}
```
Ошибки: `400 VALIDATION_ERROR`, `409 EMAIL_TAKEN`.

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
{ "success": true, "data": {
  "id": 1, "fullName": "Иван Петров", "email": "ivan@mail.ru", "role": "STUDENT"
}}
```
Ошибки: `401 UNAUTHORIZED`.

---

## 2. Events — `/api/v1/events`

### GET `/events` — список мероприятий
Доступ: все. Query: `?status=PUBLISHED&page=1&limit=20&search=форум`.
```json
// 200 OK
{ "success": true, "data": {
  "items": [
    { "id": 5, "title": "Форум актива", "startsAt": "2026-07-01T10:00:00Z",
      "location": "Актовый зал", "capacity": 100, "registeredCount": 42, "status": "PUBLISHED" }
  ],
  "page": 1, "limit": 20, "total": 1
}}
```

### GET `/events/:id` — детали мероприятия
Доступ: все.
```json
// 200 OK
{ "success": true, "data": {
  "id": 5, "title": "Форум актива", "description": "Описание...",
  "location": "Актовый зал", "startsAt": "2026-07-01T10:00:00Z",
  "capacity": 100, "registeredCount": 42, "freeSeats": 58, "status": "PUBLISHED",
  "organizer": { "id": 3, "fullName": "Анна Смирнова" }
}}
```
Ошибки: `404 NOT_FOUND`.

### POST `/events` — создать мероприятие
Доступ: `ORGANIZER`, `ADMIN`.
```json
// Запрос
{ "title": "Форум актива", "description": "Описание...", "location": "Актовый зал",
  "startsAt": "2026-07-01T10:00:00Z", "capacity": 100 }
```
```json
// 201 Created
{ "success": true, "data": { "id": 5, "status": "DRAFT", "organizerId": 3 } }
```
Ошибки: `400 VALIDATION_ERROR`, `401 UNAUTHORIZED`, `403 FORBIDDEN`.

### PUT `/events/:id` — редактировать
Доступ: `ORGANIZER` (только своё), `ADMIN`.
```json
// Запрос (любые изменяемые поля)
{ "title": "Форум актива 2026", "capacity": 120, "status": "PUBLISHED" }
```
```json
// 200 OK
{ "success": true, "data": { "id": 5, "title": "Форум актива 2026", "capacity": 120, "status": "PUBLISHED" } }
```
Ошибки: `400`, `401`, `403 FORBIDDEN` (чужое мероприятие), `404 NOT_FOUND`.

### DELETE `/events/:id` — удалить
Доступ: `ORGANIZER` (только своё), `ADMIN`.
```
// 204 No Content
```
Ошибки: `401`, `403`, `404`.

### GET `/events/:id/participants` — участники мероприятия
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

### GET `/events/:id/participants/export` — экспорт участников
Доступ: `ORGANIZER` (только своё), `ADMIN`. Ответ: файл `text/csv`.
```
// 200 OK  (Content-Type: text/csv)
fullName,email,status,createdAt
Иван Петров,ivan@mail.ru,ACTIVE,2026-06-10T12:00:00Z
```

---

## 3. Registrations — `/api/v1/registrations`

### POST `/events/:id/register` — записаться на мероприятие
Доступ: `STUDENT`.
```json
// 201 Created
{ "success": true, "data": { "id": 11, "eventId": 5, "userId": 1, "status": "ACTIVE" } }
```
Ошибки: `401 UNAUTHORIZED`, `403 FORBIDDEN`, `404 NOT_FOUND`,
`409 EVENT_FULL`, `409 ALREADY_REGISTERED`.

### GET `/registrations/my` — мои регистрации
Доступ: `STUDENT`.
```json
// 200 OK
{ "success": true, "data": {
  "items": [
    { "id": 11, "status": "ACTIVE",
      "event": { "id": 5, "title": "Форум актива", "startsAt": "2026-07-01T10:00:00Z" } }
  ],
  "total": 1
}}
```
Ошибки: `401`.

### DELETE `/registrations/:id` — отменить регистрацию
Доступ: `STUDENT` (только свою). Переводит `status` в `CANCELLED`.
```
// 204 No Content
```
Ошибки: `401`, `403` (чужая), `404`.

---

## 4. Admin / Users — `/api/v1/admin`

### GET `/admin/users` — список пользователей
Доступ: `ADMIN`. Query: `?role=STUDENT&page=1&limit=20&search=иван`.
```json
// 200 OK
{ "success": true, "data": {
  "items": [
    { "id": 1, "fullName": "Иван Петров", "email": "ivan@mail.ru", "role": "STUDENT", "isBlocked": false }
  ],
  "page": 1, "limit": 20, "total": 1
}}
```
Ошибки: `401`, `403`.

### PATCH `/admin/users/:id/role` — изменить роль
Доступ: `ADMIN`.
```json
// Запрос
{ "role": "ORGANIZER" }
```
```json
// 200 OK
{ "success": true, "data": { "id": 1, "role": "ORGANIZER" } }
```
Ошибки: `400 VALIDATION_ERROR`, `401`, `403`, `404`.

### PATCH `/admin/users/:id/block` — блокировка / разблокировка
Доступ: `ADMIN`.
```json
// Запрос
{ "isBlocked": true }
```
```json
// 200 OK
{ "success": true, "data": { "id": 1, "isBlocked": true } }
```
Ошибки: `400`, `401`, `403`, `404`.

---

## 5. Notifications — `/api/v1/notifications`

### GET `/notifications` — мои уведомления
Доступ: авторизованный.
```json
// 200 OK
{ "success": true, "data": {
  "items": [
    { "id": 7, "message": "Вы зарегистрированы на «Форум актива»", "isRead": false,
      "eventId": 5, "createdAt": "2026-06-10T12:00:00Z" }
  ],
  "total": 1
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
| POST | `/auth/register` | все | Регистрация аккаунта |
| POST | `/auth/login` | все | Вход, выдача JWT |
| GET | `/auth/me` | auth | Текущий пользователь |
| GET | `/events` | все | Список мероприятий |
| GET | `/events/:id` | все | Детали мероприятия |
| POST | `/events` | ORGANIZER, ADMIN | Создать |
| PUT | `/events/:id` | ORGANIZER(своё), ADMIN | Редактировать |
| DELETE | `/events/:id` | ORGANIZER(своё), ADMIN | Удалить |
| GET | `/events/:id/participants` | ORGANIZER(своё), ADMIN | Список участников |
| GET | `/events/:id/participants/export` | ORGANIZER(своё), ADMIN | Экспорт CSV |
| POST | `/events/:id/register` | STUDENT | Записаться |
| GET | `/registrations/my` | STUDENT | Мои регистрации |
| DELETE | `/registrations/:id` | STUDENT(своё) | Отменить запись |
| GET | `/admin/users` | ADMIN | Список пользователей |
| PATCH | `/admin/users/:id/role` | ADMIN | Сменить роль |
| PATCH | `/admin/users/:id/block` | ADMIN | Блокировка |
| GET | `/notifications` | auth | Мои уведомления |
| PATCH | `/notifications/:id/read` | auth | Отметить прочитанным |
