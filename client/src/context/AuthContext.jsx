import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api('/auth/me').then((r) => setUser(r.data.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);
  async function login(credentials) {
    const result = await api('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    setUser(result.data.user);
  }
  async function register(details) {
    const result = await api('/auth/register', { method: 'POST', body: JSON.stringify(details) });
    setUser(result.data.user);
  }
  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    setUser(null);
  }
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
