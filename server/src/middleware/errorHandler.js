import { Prisma } from '@prisma/client';

export function notFound(req, res) {
  res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'The requested endpoint was not found.' });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error?.code === 'P2002') {
    return res.status(409).json({ success: false, code: 'DUPLICATE_SLOT', message: 'A reading already exists for this date and time slot.' });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'The requested record was not found.' });
  }
  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) console.error(error);
  res.status(status).json({
    success: false,
    code: error.code || 'INTERNAL_ERROR',
    message: status >= 500 ? 'Something went wrong. Please try again.' : error.message,
  });
}
