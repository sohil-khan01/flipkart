import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext(null);

const TOKEN_KEY = 'admin_token_v1';

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function verify() {
      if (!token) {
        if (active) setLoading(false);
        return;
      }

      try {
        await axios.get('/api/admin/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem(TOKEN_KEY);
          if (active) setToken('');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, [token]);

  const loginWithPin = async (pin) => {
    const res = await axios.post('/api/admin/login', { pin });
    const nextToken = res?.data?.token || '';
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    return nextToken;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
  };

  const value = useMemo(
    () => ({ token, isAuthed: Boolean(token), loading, loginWithPin, logout }),
    [token, loading]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
