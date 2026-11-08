import * as reports from '../services/reportService.js';
export async function daily(req, res) {
  res.json({ success: true, data: { report: await reports.daily(req.user.id, req.query.date) } });
}
export async function monthToDate(req, res) {
  res.json({ success: true, data: { report: await reports.monthToDate(req.user.id, req.query.date) } });
}
export async function monthly(req, res) {
  res.json({ success: true, data: { report: await reports.previousMonth(req.user.id, req.query.date) } });
}
