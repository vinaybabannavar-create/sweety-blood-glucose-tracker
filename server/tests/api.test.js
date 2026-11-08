import 'dotenv/config';
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

let agent;
let email;
const password = 'TestPassword123!';

before(async () => {
  await prisma.$connect();
  email = `test-${Date.now()}@sweety.test`;
  agent = request.agent(app);
});

after(async () => {
  if (email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) await prisma.user.delete({ where: { id: user.id } });
  }
  await prisma.$disconnect();
});

test('registers a user and returns an authenticated session', async () => {
  const response = await agent.post('/api/auth/register').send({
    name: 'Test Patient', email, password,
  });
  assert.equal(response.status, 201);
  assert.equal(response.body.data.user.email, email);
  assert.ok(response.headers['set-cookie']);
  const user = await prisma.user.findUnique({ where: { email } });
  assert.ok(user.passwordHash !== password);
});

test('requires authentication for reading routes', async () => {
  const response = await request(app).get('/api/readings');
  assert.equal(response.status, 401);
});

test('creates a reading and prevents a duplicate slot', async () => {
  const date = new Date();
  const readingDate = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const payload = { readingDate, timeSlot: 'morning', glucoseValue: 105 };
  const created = await agent.post('/api/readings').send(payload);
  assert.equal(created.status, 201);
  const duplicate = await agent.post('/api/readings').send(payload);
  assert.equal(duplicate.status, 409);
  assert.equal(duplicate.body.code, 'DUPLICATE_SLOT');
});

test('rejects glucose values outside the allowed range', async () => {
  const date = new Date();
  const readingDate = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const response = await agent.post('/api/readings').send({
    readingDate, timeSlot: 'after_breakfast', glucoseValue: 601,
  });
  assert.equal(response.status, 400);
  assert.equal(response.body.code, 'INVALID_VALUE');
});
