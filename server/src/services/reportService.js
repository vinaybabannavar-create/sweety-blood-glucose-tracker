import { prisma } from '../config/prisma.js';
import { parseCalendarDate, monthStart, previousMonthRange, nextDay, dateString } from '../utils/date.js';

function summarize(readings) {
  const values = readings.map((r) => r.glucoseValue);
  if (!values.length) return { highest: null, lowest: null, average: null, count: 0 };
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    highest: Math.max(...values),
    lowest: Math.min(...values),
    average: Math.round((sum / values.length) * 10) / 10,
    count: values.length,
  };
}

async function report(userId, start, end, includeReadings = false) {
  const readings = await prisma.reading.findMany({
    where: { userId, readingDate: { gte: start, lte: end } },
    orderBy: [{ readingDate: 'asc' }, { timeSlot: 'asc' }],
  });
  return { startDate: dateString(start), endDate: dateString(end), ...summarize(readings), ...(includeReadings ? { readings } : {}) };
}

export async function daily(userId, dateValue) {
  const date = parseCalendarDate(dateValue || dateString(new Date()));
  return report(userId, date, date, true);
}
export async function monthToDate(userId, dateValue) {
  const date = parseCalendarDate(dateValue || dateString(new Date()));
  return report(userId, monthStart(date), date);
}
export async function previousMonth(userId, dateValue) {
  const date = parseCalendarDate(dateValue || dateString(new Date()));
  const { start, end } = previousMonthRange(date);
  return report(userId, start, end);
}
