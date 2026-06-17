# Schoolify

Платформа волонтёрской программы для учеников и студентов: события по категориям,
запись с начислением очков и часов, уровни/бейджи и рейтинг волонтёров, кабинет
организатора и администрирование.

**Стек:** Node.js + Express 5 (API) · Vue 3 + Vite + Pinia (SPA) · Prisma + SQLite (БД).

## Структура

```
client/   — фронтенд (Vue 3 + Vite)
server/   — бэкенд (Express + Prisma)
docs/     — архитектура, ER-диаграмма, API-контракт, бэклог
```

Документация проектирования — в [`docs/`](docs/):
[архитектура](docs/architecture.md) · [ER-диаграмма](docs/er-diagram.md) ·
[API-контракт](docs/api-contract.md) · [бэклог](docs/backlog.md).

## Требования

- Node.js 20+ (используется `node --watch`)
- npm

## Установка

```bash
npm run install:all
```

Установит зависимости в корне, в `server/` и в `client/`.

## Настройка БД (первый запуск)

```bash
cd server
copy .env.example .env        # Windows (PowerShell: Copy-Item .env.example .env)
npm run db:migrate            # создаст SQLite-базу и таблицы
npm run db:seed               # наполнит тестовыми данными
cd ..
```

Тестовые аккаунты (пароль у всех — `password123`):

| Email | Роль |
|---|---|
| admin@schoolify.ru | ADMIN |
| organizer@schoolify.ru | ORGANIZER |
| alina@schoolify.ru | STUDENT (волонтёр, лидер рейтинга) |
| marina@schoolify.ru · dmitry@schoolify.ru · elena@schoolify.ru · student@schoolify.ru | STUDENT |

## Запуск

```bash
npm run dev
```

- API: http://localhost:4000/api/v1
- Frontend: http://localhost:5173

Запросы фронта на `/api` проксируются на бэкенд (см. `client/vite.config.js`).

Можно запускать по отдельности:

```bash
npm run dev:server
npm run dev:client
```

## Проверка API

```bash
curl http://localhost:4000/api/v1/health
curl http://localhost:4000/api/v1/events
```

## Возможности

- **Гость/все:** просмотр событий с поиском и фильтром по категориям (Эко/Помощь/Обучение/Спорт).
- **Волонтёр:** регистрация и вход, запись/отмена на события, профиль с очками,
  уровнем, бейджами и дневником активности, рейтинг волонтёров (неделя/месяц/всё время).
- **Организатор:** CRUD своих событий, список участников, экспорт в CSV.
- **Администратор:** управление пользователями (поиск, роли, блокировка).
- Геймификация (очки, часы, уровень, место) вычисляется из регистраций — без рассинхрона.
