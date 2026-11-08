import { HttpError } from './httpError.js';

export function parseCalendarDate(value, field = 'date') {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, `${field} must use YYYY-MM-DD format.`, 'INVALID_DATE');
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new HttpError(400, `${field} is not a valid calendar date.`, 'INVALID_DATE');
  }
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  if (date > todayUtc) throw new HttpError(400, 'Date cannot be in the future.', 'FUTURE_DATE');
  return date;
}

export function dateString(date) {
  return date.toISOString().slice(0, 10);
}

export function monthStart(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function previousMonthRange(date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 0));
  return { start, end };
}

export function nextDay(date) {
  return new Date(date.getTime() + 86400000);
}
