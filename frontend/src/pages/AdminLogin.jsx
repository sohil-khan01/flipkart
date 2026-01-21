import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLogin() {
  const { loginWithPin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin/orders';

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithPin(pin);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="bg-[#f1f3f6]">
        <div className="mx-auto max-w-xl px-4 py-10">
          <div className="rounded-md bg-white p-6 shadow-sm">
            <div className="text-lg font-extrabold text-slate-900">Admin Login</div>
            <div className="mt-1 text-sm text-slate-600">Enter your admin PIN to continue.</div>

            {error ? (
              <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600">Admin PIN</label>
                <input
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  className="mt-1 h-11 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2874f0]"
                  placeholder="Enter PIN"
                  type="password"
                  autoComplete="one-time-code"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-sm bg-[#2874f0] px-4 py-3 text-sm font-bold text-white hover:bg-[#1e60d6] disabled:opacity-50"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="mt-4 rounded bg-slate-50 p-3 text-xs text-slate-600">
              Production note: Set <span className="font-semibold">ADMIN_PIN</span> and <span className="font-semibold">JWT_SECRET</span> on the server.
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
