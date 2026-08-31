import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import client from '../api/client';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  // { role: 'admin', admin } or { role: 'school', school } — see
  // admin-auth.service.js#login. Schools log in through the very same form
  // as super admins (identifier + password); the backend tells us which
  // one it was.
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const token = localStorage.getItem('md_admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await client.get('/admin/auth/me');
      setSession(data.data);
    } catch {
      localStorage.removeItem('md_admin_token');
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = async ({ identifier, password }) => {
    const { data } = await client.post('/admin/auth/login', { identifier, password });
    localStorage.setItem('md_admin_token', data.data.accessToken);
    setSession({ role: data.data.role, admin: data.data.admin, school: data.data.school });
    return data.data;
  };

  const logout = () => {
    localStorage.removeItem('md_admin_token');
    setSession(null);
  };

  const admin = session?.role === 'admin' ? session.admin : null;
  const school = session?.role === 'school' ? session.school : null;
  const role = session?.role || null;

  const hasPermission = (key) => {
    if (!admin) return false;
    if (!admin.permissions || admin.permissions.length === 0) return false;
    return admin.permissions.includes(key);
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, school, role, loading, isAuthenticated: Boolean(session), login, logout, hasPermission }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
