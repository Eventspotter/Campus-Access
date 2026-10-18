import { createContext, useContext, useEffect, useState } from 'react';
import * as auth from '../api/auth.api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function restore() {
    setLoading(true); setError('');
    try { setUser((await auth.getMe()).user); }
    catch (err) { if (err.status !== 401) setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    restore();
    const expired = () => setUser(null);
    window.addEventListener('session-expired', expired);
    return () => window.removeEventListener('session-expired', expired);
  }, []);
  async function login(credentials) { const data = await auth.login(credentials); if (!data.mfaRequired) setUser(data.user); return data; }
  async function logout() {
    try { await auth.logout(); } catch (err) { if (err.status !== 401) throw err; }
    setUser(null);
  }
  return <AuthContext.Provider value={{ user, loading, error, restore, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
