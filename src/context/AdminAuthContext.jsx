import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import client from '../api/client';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAdmin = useCallback(async () => {
    const token = localStorage.getItem('md_admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await client.get('/admin/auth/me');
      setAdmin(data.data);
    } catch {
      localStorage.removeItem('md_admin_token');
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  const login = async ({ email, password }) => {
    const { data } = await client.post('/admin/auth/login', { email, password });
    localStorage.setItem('md_admin_token', data.data.accessToken);
    setAdmin(data.data.admin);
    return data.data;
  };

  const logout = () => {
    localStorage.removeItem('md_admin_token');
    setAdmin(null);
  };

  const hasPermission = (key) => {
    if (!admin) return false;
    if (!admin.permissions || admin.permissions.length === 0) return false;
    return admin.permissions.includes(key);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, isAuthenticated: Boolean(admin), login, logout, hasPermission }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
