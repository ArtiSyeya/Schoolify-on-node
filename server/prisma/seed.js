import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // очистка (порядок важен из-за внешних ключей)
  await prisma.registration.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // --- Пользователи ---
  const admin = await prisma.user.create({
    data: { fullName: 'Админ Системы', email: 'admin@schoolify.ru', passwordHash, role: 'ADMIN' },
  });
  const organizer = await prisma.user.create({
    data: {
      fullName: 'Анна Смирнова',
      email: 'organizer@schoolify.ru',
      passwordHash,
      role: 'ORGANIZER',
      phone: '+7 900 000-00-00',
    },
  });

  const volunteers = await Promise.all(
    [
      { fullName: 'Алина Смирнова', email: 'alina@schoolify.ru' },
      { fullName: 'Марина Кузнецова', email: 'marina@schoolify.ru' },
      { fullName: 'Дмитрий Волков', email: 'dmitry@schoolify.ru' },
      { fullName: 'Елена Романова', email: 'elena@schoolify.ru' },
      { fullName: 'Иван Петров', email: 'student@schoolify.ru' },
    ].map((u) =>
      prisma.user.create({ data: { ...u, passwordHash, role: 'STUDENT', phone: '+7 900 111-22-33' } }),
    ),
  );
  const [alina, marina, dmitry, elena, ivan] = volunteers;

  // --- Мероприятия (организатор — Анна) ---
  const E = (title, organization, category, points, startsAt, endsAt, capacity) =>
    prisma.event.create({
      data: {
        title,
        organization,
        category,
        points,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        capacity,
        status: 'PUBLISHED',
        organizerId: organizer.id,
        description: `${title}. Организатор: ${organization}.`,
        location: organization,
      },
    });

  const events = await Promise.all([
    E('Очистка парка Победы', 'Чистый город', 'ECO', 120, '2026-06-14T10:00:00', '2026-06-14T14:00:00', 12),
    E('Помощь сиротам', 'Фонд Дети', 'HELP', 200, '2026-06-16T09:00:00', '2026-06-16T18:00:00', 5),
    E('Переработка бумаги', 'ЭкоГород', 'ECO', 80, '2026-06-20T11:00:00', '2026-06-20T15:00:00', 30),
    E('Мастеркласс по рисованию', 'Культурный центр', 'EDU', 60, '2026-06-22T14:00:00', '2026-06-22T17:00:00', 8),
    E('Забег на время', 'Спортфонд', 'SPORT', 100, '2026-06-28T08:00:00', '2026-06-28T12:00:00', 50),
    E('Помощь бездомным животным', 'Приют «Лапа»', 'HELP', 160, '2026-06-18T09:00:00', '2026-06-18T13:00:00', 20),
    E('Сбор макулатуры', 'ЭкоГород', 'ECO', 70, '2026-06-25T10:00:00', '2026-06-25T13:00:00', 40),
    E('Лекция по первой помощи', 'Красный Крест', 'EDU', 90, '2026-06-30T16:00:00', '2026-06-30T18:00:00', 25),
    E('Турнир по футболу', 'Спортфонд', 'SPORT', 110, '2026-07-05T09:00:00', '2026-07-05T13:00:00', 60),
    E('Посадка деревьев', 'Чистый город', 'ECO', 140, '2026-07-10T10:00:00', '2026-07-10T15:00:00', 35),
  ]);

  // --- Регистрации (формируют очки/часы/рейтинг) ---
  // helper: записать пользователя на набор индексов мероприятий
  const reg = (user, idxs) =>
    Promise.all(
      idxs.map((i) =>
        prisma.registration.create({ data: { userId: user.id, eventId: events[i].id, status: 'ACTIVE' } }),
      ),
    );

  await reg(alina, [0, 1, 2, 5, 7]); // 120+200+80+160+90 = 650 ... (часы суммируются)
  await reg(marina, [1, 3, 4, 6, 9]);
  await reg(dmitry, [0, 4, 8]);
  await reg(elena, [2, 5, 7]);
  await reg(ivan, [0]);

  // уведомления для Алины (как пример наполнения)
  await prisma.notification.createMany({
    data: [
      { userId: alina.id, eventId: events[0].id, message: 'Вы зарегистрированы на «Очистка парка Победы»' },
      { userId: alina.id, eventId: events[1].id, message: 'Вы зарегистрированы на «Помощь сиротам»' },
    ],
  });

  console.log('Seed готов.');
  console.log('Логин-аккаунты (пароль у всех: password123):');
  console.log('  admin@schoolify.ru — администратор');
  console.log('  organizer@schoolify.ru — организатор');
  console.log('  alina@schoolify.ru / marina@ / dmitry@ / elena@ / student@ — волонтёры');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
