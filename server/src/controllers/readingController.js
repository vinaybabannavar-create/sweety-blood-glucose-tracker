import * as service from '../services/readingService.js';

export async function list(req, res) {
  const result = await service.listReadings(req.user.id, req.query);
  res.json({ success: true, data: result });
}
export async function get(req, res) {
  const reading = await service.getReading(req.user.id, req.params.id);
  res.json({ success: true, data: { reading } });
}
export async function create(req, res) {
  const reading = await service.createReading(req.user.id, req.body);
  res.status(201).json({ success: true, data: { reading } });
}
export async function update(req, res) {
  const reading = await service.updateReading(req.user.id, req.params.id, req.body);
  res.json({ success: true, data: { reading } });
}
export async function remove(req, res) {
  await service.deleteReading(req.user.id, req.params.id);
  res.json({ success: true, message: 'Reading deleted.' });
}
