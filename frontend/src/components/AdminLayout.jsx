import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

function NavItem({ to, label }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center justify-between rounded-sm px-3 py-2 text-sm font-semibold transition ${
        active ? 'bg-[#2874f0] text-white' : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      <span>{label}</span>
      <span className={`text-xs ${active ? 'text-white/90' : 'text-slate-400'}`}>›</span>
    </Link>
  );
}

export default function AdminLayout({ title, subtitle, children }) {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <header className="sticky top-0 z-40 bg-[#2874f0]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-4">
          <Link to="/" className="text-sm font-extrabold text-white">
            Flipkart Style • Admin
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/admin/login', { replace: true });
            }}
            className="rounded-sm bg-white px-3 py-2 text-xs font-bold text-[#2874f0] hover:bg-white/95"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="bg-[#f1f3f6]">
        <div className="mx-auto grid max-w-7xl gap-4 px-3 py-4 sm:px-4 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-md bg-white p-3 shadow-sm">
            <div className="px-3 pb-2 text-xs font-extrabold text-slate-500">DASHBOARD</div>
            <div className="grid gap-1">
              <NavItem to="/admin/orders" label="Orders" />
              <NavItem to="/admin/products" label="Add Product" />
            </div>
          </aside>

          <main className="rounded-md bg-white p-4 shadow-sm">
            {title ? <div className="text-base font-extrabold text-slate-900">{title}</div> : null}
            {subtitle ? <div className="mt-1 text-xs text-slate-500">{subtitle}</div> : null}
            <div className={title || subtitle ? 'mt-4' : ''}>{children}</div>
          </main>
        </div>
      </section>
    </div>
  );
}
