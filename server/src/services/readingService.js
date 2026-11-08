import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { parseCalendarDate, dateString, nextDay } from '../utils/date.js';

export const SLOTS = ['morning', 'after_breakfast', 'after_lunch', 'after_dinner'];

export function validateReadingInput(input) {
  const { readingDate, timeSlot, glucoseValue } = input || {};
  if (glucoseValue === undefined || glucoseValue === null || glucoseValue === '') {
    throw new HttpError(400, 'Please enter a glucose value.', 'VALUE_REQUIRED');
  }
  if (!Number.isInteger(Number(glucoseValue)) || String(glucoseValue).trim() === '') {
    throw new HttpError(400, 'Value must be a whole number between 40 and 600 mg/dl.', 'INVALID_VALUE');
  }
  const value = Number(glucoseValue);
  if (value < 40 || value > 600) {
    throw new HttpError(400, 'Value must be between 40 and 600 mg/dl.', 'INVALID_VALUE');
  }
  if (!SLOTS.includes(timeSlot)) {
    throw new HttpError(400, 'Please select a valid time slot.', 'INVALID_SLOT');
  }
  const date = parseCalendarDate(readingDate, 'Reading date');
  return { readingDate: date, timeSlot, glucoseValue: value };
}

export async function listReadings(userId, query) {
  const page = Math.max(1, Number.parseInt(query.page || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit || '20', 10) || 20));
  const where = { userId };
  if (query.date) {
    const start = parseCalendarDate(query.date);
    where.readingDate = start;
  } else if (query.from || query.to) {
    where.readingDate = {};
    if (query.from) where.readingDate.gte = parseCalendarDate(query.from, 'From date');
    if (query.to) where.readingDate.lte = parseCalendarDate(query.to, 'To date');
    if (where.readingDate.gte && where.readingDate.lte && where.readingDate.gte > where.readingDate.lte) {
      throw new HttpError(400, 'From date must be on or before to date.', 'INVALID_DATE_RANGE');
    }
  }
  const [items, total] = await Promise.all([
    prisma.reading.findMany({ where, orderBy: [{ readingDate: 'desc' }, { timeSlot: 'asc' }], skip: (page - 1) * limit, take: limit }),
    prisma.reading.count({ where }),
  ]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getReading(userId, id) {
  const reading = await prisma.reading.findFirst({ where: { id, userId } });
  if (!reading) throw new HttpError(404, 'Reading not found.', 'READING_NOT_FOUND');
  return reading;
}

export async function createReading(userId, input) {
  const data = validateReadingInput(input);
  const existing = await prisma.reading.findFirst({
    where: { userId, readingDate: data.readingDate, timeSlot: data.timeSlot },
  });
  if (existing) throw new HttpError(409, `You already have an ${slotLabel(data.timeSlot)} reading for this date.`, 'DUPLICATE_SLOT');
  try {
    return await prisma.reading.create({ data: { ...data, userId } });
  } catch (error) {
    if (error.code === 'P2002') throw new HttpError(409, `You already have an ${slotLabel(data.timeSlot)} reading for this date.`, 'DUPLICATE_SLOT');
    throw error;
  }
}

export async function updateReading(userId, id, input) {
  const current = await getReading(userId, id);
  const data = validateReadingInput(input);
  const duplicate = await prisma.reading.findFirst({
    where: { userId, readingDate: data.readingDate, timeSlot: data.timeSlot, NOT: { id } },
  });
  if (duplicate) throw new HttpError(409, `You already have an ${slotLabel(data.timeSlot)} reading for this date.`, 'DUPLICATE_SLOT');
  try {
    return await prisma.reading.update({ where: { id: current.id }, data });
  } catch (error) {
    if (error.code === 'P2002') throw new HttpError(409, `You already have an ${slotLabel(data.timeSlot)} reading for this date.`, 'DUPLICATE_SLOT');
    throw error;
  }
}

export async function deleteReading(userId, id) {
  const current = await getReading(userId, id);
  await prisma.reading.delete({ where: { id: current.id } });
}

export function slotLabel(slot) {
  return ({ morning: 'Morning (fasting)', after_breakfast: 'After breakfast', after_lunch: 'After lunch', after_dinner: 'After dinner' })[slot] || slot;
}
