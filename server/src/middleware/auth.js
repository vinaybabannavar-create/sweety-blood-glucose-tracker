import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME || 'sweety_session'];
    if (!token) throw new HttpError(401, 'Please log in to continue.', 'UNAUTHENTICATED');
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new HttpError(401, 'Your session is invalid or expired. Please log in again.', 'INVALID_SESSION');
    }
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) throw new HttpError(401, 'Account not found. Please log in again.', 'INVALID_SESSION');
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
