import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { formatINR } from '../data/products';
import { useAdminAuth } from '../context/AdminAuthContext';
import { api, authHeaders } from '../utils/api';

function Pill({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-[#2874f0]/10 text-[#2874f0]',
    green: 'bg-emerald-100 text-emerald-700',
    orange: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-bold ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return String(ts);
  }
}

export default function AdminOrders() {
  const { token, logout } = useAdminAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [expanded, setExpanded] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ordersState, setOrdersState] = useState([]);

  const orders = ordersState;

  const totalOrders = orders.length;

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.get('/api/orders/admin', { headers: authHeaders(token) });
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setOrdersState(
        list.map((o) => ({
          orderId: o.orderId,
          createdAt: o.createdAt || o.updatedAt,
          customer: o.customer,
          payment: o.payment,
          items: o.items,
          subtotal: o.subtotal,
          delivery: o.delivery,
          total: o.total,
        }))
      );
    } catch (err) {
      const status = err?.response?.status;
      setError(err?.response?.data?.message || err?.message || 'Failed to load orders');
      if (status === 401 || status === 403) logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, token]);

  return (
    <AdminLayout title="Admin • Orders" subtitle="Orders fetched from backend (admin protected)">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Pill tone="blue">Total: {totalOrders}</Pill>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              api
                .delete('/api/orders/admin', { headers: authHeaders(token) })
                .then(() => {
                  setOrdersState([]);
                  setExpanded(null);
                  setRefreshKey((k) => k + 1);
                })
                .catch((err) => {
                  const status = err?.response?.status;
                  setError(err?.response?.data?.message || err?.message || 'Failed to clear orders');
                  if (status === 401 || status === 403) logout();
                });
            }}
            className="rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Clear Orders
          </button>
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="rounded-sm bg-[#2874f0] px-3 py-2 text-xs font-bold text-white hover:bg-[#1e60d6]"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? <div className="mt-6 rounded bg-slate-50 p-6 text-center text-sm text-slate-600">Loading…</div> : null}

      {!loading && orders.length === 0 ? (
        <div className="mt-6 rounded bg-slate-50 p-6 text-center text-sm text-slate-600">
          No orders yet. Place an order from checkout to see it here.
        </div>
      ) : null}

      {!loading && orders.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-xs font-bold text-slate-600">
                <th className="px-3 py-3">Order</th>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Payment</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Placed</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const isOpen = expanded === o.orderId;
                return (
                  <React.Fragment key={o.orderId}>
                    <tr className="border-b">
                      <td className="px-3 py-3">
                        <div className="font-bold text-slate-900">{o.orderId}</div>
                        <div className="text-xs text-slate-500">Items: {o.items?.length || 0}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-900">{o.customer?.name}</div>
                        <div className="text-xs text-slate-500">{o.customer?.mobile}</div>
                      </td>
                      <td className="px-3 py-3">
                        <Pill tone={o.payment === 'cod' ? 'orange' : 'green'}>{o.payment === 'cod' ? 'COD' : 'UPI'}</Pill>
                      </td>
                      <td className="px-3 py-3 font-bold text-slate-900">{formatINR(o.total)}</td>
                      <td className="px-3 py-3 text-slate-700">{formatDate(o.createdAt)}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setExpanded((cur) => (cur === o.orderId ? null : o.orderId))}
                          className="rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          {isOpen ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>

                    {isOpen ? (
                      <tr className="border-b">
                        <td colSpan={6} className="px-3 py-4">
                          <div className="grid gap-4 lg:grid-cols-2">
                            <div>
                              <div className="text-xs font-bold text-slate-600">Address</div>
                              <div className="mt-1 rounded bg-slate-50 p-3 text-sm text-slate-700">{o.customer?.address}</div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-600">Items</div>
                              <div className="mt-1 divide-y rounded border border-slate-200">
                                {(o.items || []).map((it) => (
                                  <div key={it.productId} className="flex items-start justify-between gap-3 p-3 text-sm">
                                    <div className="font-semibold text-slate-900">
                                      {it.title}
                                      <span className="text-slate-500"> × {it.qty}</span>
                                    </div>
                                    <div className="shrink-0 font-bold text-slate-900">{formatINR(it.price * it.qty)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </AdminLayout>
  );
}
