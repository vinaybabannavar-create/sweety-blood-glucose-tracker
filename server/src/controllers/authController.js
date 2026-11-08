import * as authService from '../services/authService.js';

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export async function register(req, res) {
  const user = await authService.register(req.body);
  const token = authService.createToken(user);
  res.cookie(process.env.COOKIE_NAME || 'sweety_session', token, cookieOptions());
  res.status(201).json({ success: true, data: { user } });
}

export async function login(req, res) {
  const user = await authService.login(req.body);
  const token = authService.createToken(user);
  res.cookie(process.env.COOKIE_NAME || 'sweety_session', token, cookieOptions());
  res.json({ success: true, data: { user } });
}

export function logout(req, res) {
  res.clearCookie(process.env.COOKIE_NAME || 'sweety_session', {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.json({ success: true, message: 'You have been logged out.' });
}

export function me(req, res) {
  res.json({ success: true, data: { user: req.user } });
}
