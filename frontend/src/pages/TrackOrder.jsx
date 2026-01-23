import React, { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../utils/api';
import { formatINR } from '../data/products';

function Pill({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-100 text-emerald-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center rounded px-2 py-1 text-xs font-bold ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

function toDateStr(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toDateString();
}

function ItemThumbs({ items }) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {list.slice(0, 6).map((it, idx) => (
        <div key={`${it.productId || idx}-${idx}`} className="flex items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1">
          {it.image ? (
            <img src={it.image} alt="" className="h-10 w-10 rounded object-cover" loading="lazy" />
          ) : (
            <div className="h-10 w-10 rounded bg-slate-100" />
          )}
          <div className="max-w-[220px]">
            <div className="line-clamp-1 text-xs font-semibold text-slate-900">{it.title}</div>
            <div className="text-[11px] text-[#878787]">Qty: {Number(it.qty || 0)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function computeTimeline(createdAt, deliveryDate) {
  const placedAt = new Date(createdAt);
  const shipAt = new Date(placedAt.getTime() + 1 * 24 * 60 * 60 * 1000);
  const deliveredAt = new Date(deliveryDate);

  const now = new Date();

  const shippedDone = now.getTime() >= shipAt.getTime();
  const deliveredDone = deliveryDate ? now.getTime() >= deliveredAt.getTime() : false;

  return [
    {
      label: 'Order Placed',
      date: toDateStr(placedAt),
      done: true,
    },
    {
      label: 'Shipped',
      date: toDateStr(shipAt),
      done: shippedDone,
    },
    {
      label: 'Delivered',
      date: toDateStr(deliveredAt),
      done: deliveredDone,
    },
  ];
}

function Timeline({ steps }) {
  return (
    <div className="mt-4">
      <div className="relative pl-6">
        <div className="absolute left-[11px] top-0 h-full w-[2px] bg-slate-200" />
        <div className="space-y-4">
          {steps.map((s, idx) => (
            <div key={s.label} className="relative">
              <div
                className={`absolute left-0 top-[2px] flex h-6 w-6 items-center justify-center rounded-full border ${
                  s.done ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'
                }`}
              >
                {s.done ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20 6 9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <div className="h-2 w-2 rounded-full bg-slate-300" />
                )}
              </div>
              <div className="ml-10">
                <div className={`text-sm font-semibold ${s.done ? 'text-slate-900' : 'text-slate-600'}`}>{s.label}</div>
                {s.date ? <div className="text-xs text-[#878787]">{s.date}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TrackOrder() {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);

  const normalizedMobile = useMemo(() => String(mobile || '').replace(/\D/g, '').slice(-10), [mobile]);

  const onTrack = async (e) => {
    e.preventDefault();
    setError('');

    if (normalizedMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/api/orders/track?mobile=${encodeURIComponent(normalizedMobile)}`);
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setOrders(list);
      if (list.length === 0) {
        setError('No orders found for this mobile number.');
      }
    } catch (err) {
      setOrders([]);
      setError(err?.response?.data?.message || err?.message || 'Failed to track orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="bg-[#f1f3f6]">
        <div className="mx-auto max-w-5xl px-3 py-4 sm:px-4">
          <div className="bg-white shadow-sm">
            <div className="border-b border-[#f0f0f0] px-6 py-4">
              <div className="text-base font-semibold text-slate-900">Track your order</div>
              <div className="mt-1 text-xs text-[#878787]">Enter your mobile number to view order status.</div>
            </div>

            <div className="px-6 py-6">
              <form onSubmit={onTrack} className="grid gap-3 sm:grid-cols-[1fr_160px]">
                <div>
                  <label className="text-xs font-bold text-slate-600">Mobile number</label>
                  <input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="mt-1 h-11 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2874f0]"
                    placeholder="10-digit mobile"
                    inputMode="numeric"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 h-11 rounded-sm bg-[#2874f0] px-4 text-sm font-bold text-white hover:bg-[#1e60d6] disabled:opacity-60"
                >
                  {loading ? 'Tracking…' : 'Track'}
                </button>
              </form>

              {error ? (
                <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
              ) : null}

              {orders.length ? (
                <div className="mt-6 grid gap-4">
                  {orders.map((o) => {
                    const steps = computeTimeline(o.createdAt, o.deliveryDate);
                    const deliveryStr = toDateStr(o.deliveryDate);
                    const itemCount = Array.isArray(o.items) ? o.items.reduce((s, it) => s + Number(it.qty || 0), 0) : 0;
                    const status = String(o.status || '');
                    const statusTone = status === 'pending' ? 'orange' : status === 'rejected' ? 'red' : status ? 'green' : 'slate';
                    const statusLabel = status === 'pending' ? 'Pending' : status === 'rejected' ? 'Rejected' : status === 'confirmed' ? 'Confirmed' : '';

                    return (
                      <div key={o.orderId} className="rounded border border-slate-200 bg-white p-4">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                          <div>
                            <div className="text-xs font-semibold text-[#878787]">ORDER ID</div>
                            <div className="mt-1 font-mono text-sm font-semibold text-slate-900">{o.orderId}</div>
                            <div className="mt-1 text-xs text-slate-600">
                              {itemCount} item{itemCount === 1 ? '' : 's'} • Total {formatINR(Number(o.total || 0))}
                            </div>
                            {statusLabel ? (
                              <div className="mt-2">
                                <Pill tone={statusTone}>{statusLabel}</Pill>
                              </div>
                            ) : null}
                            {status === 'rejected' ? (
                              <div className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                                Payment rejected. Please try again.
                              </div>
                            ) : null}
                          </div>
                          {deliveryStr ? (
                            <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                              Delivery by {deliveryStr}
                            </div>
                          ) : null}
                        </div>

                        <ItemThumbs items={o.items} />
                        <Timeline steps={steps} />
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
