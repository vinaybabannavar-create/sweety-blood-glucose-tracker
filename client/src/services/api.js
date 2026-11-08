const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function api(path, options = {}) {
  const response = await fetch(`${BASE_URL}/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || 'Something went wrong.');
    error.status = response.status;
    error.code = payload.code;
    throw error;
  }
  return payload;
}
