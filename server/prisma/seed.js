import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

try {
  const passwordHash = await bcrypt.hash('SweetyDemo123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@sweety.local' },
    update: { name: 'Demo Patient', passwordHash },
    create: { name: 'Demo Patient', email: 'demo@sweety.local', passwordHash },
  });
  await prisma.reading.deleteMany({ where: { userId: user.id } });
  const today = new Date();
  const dateOnly = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const values = [
    ['morning', 105], ['after_breakfast', 142], ['after_lunch', 136], ['after_dinner', 128],
  ];
  await prisma.reading.createMany({
    data: values.map(([timeSlot, glucoseValue]) => ({
      userId: user.id, readingDate: dateOnly, timeSlot, glucoseValue,
    })),
  });
  console.log('Seed complete: demo@sweety.local / SweetyDemo123!');
} finally {
  await prisma.$disconnect();
}
