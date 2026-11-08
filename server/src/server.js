import 'dotenv/config';
import { app } from './app.js';
import { prisma } from './config/prisma.js';

const port = Number(process.env.PORT || 4000);
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to a random value with at least 32 characters.');
}
try {
  await prisma.$connect();
  app.listen(port, () => console.log(`Sweety API listening on http://localhost:${port}`));
} catch (error) {
  console.error('Could not connect to PostgreSQL:', error);
  process.exit(1);
}

async function shutdown() {
  await prisma.$disconnect();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
