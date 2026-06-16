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

  const admin = await prisma.user.create({
    data: { fullName: 'Админ Системы', email: 'admin@schoolify.ru', passwordHash, role: 'ADMIN' },
  });
  const organizer = await prisma.user.create({
    data: { fullName: 'Анна Смирнова', email: 'organizer@schoolify.ru', passwordHash, role: 'ORGANIZER' },
  });
  const student = await prisma.user.create({
    data: { fullName: 'Иван Петров', email: 'student@schoolify.ru', passwordHash, role: 'STUDENT' },
  });

  await prisma.event.createMany({
    data: [
      {
        title: 'Форум школы актива 2026',
        description: 'Большой ежегодный форум: спикеры, мастер-классы, нетворкинг.',
        location: 'Актовый зал',
        startsAt: new Date('2026-07-01T10:00:00Z'),
        capacity: 100,
        status: 'PUBLISHED',
        organizerId: organizer.id,
      },
      {
        title: 'Тренинг по лидерству',
        description: 'Практический тренинг для активистов: командная работа и публичные выступления.',
        location: 'Аудитория 204',
        startsAt: new Date('2026-07-10T15:00:00Z'),
        capacity: 30,
        status: 'PUBLISHED',
        organizerId: organizer.id,
      },
      {
        title: 'Квиз «Знатоки актива»',
        description: 'Интеллектуальная игра командами по 5 человек.',
        location: 'Холл 1 этажа',
        startsAt: new Date('2026-07-15T18:00:00Z'),
        capacity: 0,
        status: 'PUBLISHED',
        organizerId: organizer.id,
      },
    ],
  });

  console.log('Seed готов.');
  console.log('Пользователи (пароль у всех: password123):');
  console.log('  admin@schoolify.ru, organizer@schoolify.ru, student@schoolify.ru');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
