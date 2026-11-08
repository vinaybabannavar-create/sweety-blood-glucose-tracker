import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';

export async function register({ name, email, password }) {
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    throw new HttpError(400, 'Name must be between 2 and 100 characters.', 'INVALID_NAME');
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new HttpError(400, 'Please enter a valid email address.', 'INVALID_EMAIL');
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    throw new HttpError(400, 'Password must be between 8 and 72 characters.', 'INVALID_PASSWORD');
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (await prisma.user.findUnique({ where: { email: normalizedEmail } })) {
    throw new HttpError(409, 'An account with this email already exists.', 'EMAIL_EXISTS');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    return await prisma.user.create({
      data: { name: name.trim(), email: normalizedEmail, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  } catch (error) {
    if (error.code === 'P2002') throw new HttpError(409, 'An account with this email already exists.', 'EMAIL_EXISTS');
    throw error;
  }
}

export async function login({ email, password }) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Email and password are required.', 'MISSING_CREDENTIALS');
  }
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!valid) throw new HttpError(401, 'Email or password is incorrect.', 'INVALID_CREDENTIALS');
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export function createToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}
