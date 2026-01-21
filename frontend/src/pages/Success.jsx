import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../utils/api';

function toDateStr(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toDateString();
}

function computeTimeline(createdAt, deliveryDate) {
  const placedAt = new Date(createdAt);
  const shipAt = new Date(placedAt.getTime() + 1 * 24 * 60 * 60 * 1000);
  const deliveredAt = new Date(deliveryDate);
  const now = new Date();
  return [
    { label: 'Order Placed', date: toDateStr(placedAt), done: true },
    { label: 'Shipped', date: toDateStr(shipAt), done: now.getTime() >= shipAt.getTime() },
    { label: 'Delivered', date: toDateStr(deliveredAt), done: deliveryDate ? now.getTime() >= deliveredAt.getTime() : false },
  ];
}

function Timeline({ steps }) {
  return (
    <div className="mt-4">
      <div className="relative pl-6">
        <div className="absolute left-[11px] top-0 h-full w-[2px] bg-slate-200" />
        <div className="space-y-4">
          {steps.map((s) => (
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

export default function Success() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-DEMO';
  const [deliveryDate, setDeliveryDate] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await api.get(`/api/orders/${encodeURIComponent(orderId)}`);
        const data = res?.data?.data;
        const raw = data?.deliveryDate;
        if (!active) return;
        if (raw) {
          const d = new Date(raw);
          setDeliveryDate(Number.isNaN(d.getTime()) ? '' : d.toDateString());
        } else {
          setDeliveryDate('');
        }
        setCreatedAt(data?.createdAt || '');
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch {
        if (active) {
          setDeliveryDate('');
          setCreatedAt('');
          setItems([]);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [orderId]);

  return (
    <Layout>
      <section className="bg-[#f1f3f6]">
        <div className="mx-auto max-w-5xl px-3 py-4 sm:px-4">
          <div className="bg-white shadow-sm">
            <div className="border-b border-[#f0f0f0] px-6 py-4">
              <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20 6 9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-emerald-800">Order placed successfully</div>
                    <div className="text-xs text-emerald-700">We have received your order and will start processing it soon.</div>
                    {deliveryDate ? (
                      <div className="mt-2 text-sm font-semibold text-emerald-800">Delivery by {deliveryDate}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="rounded border border-slate-200 bg-white px-4 py-4">
                <div className="text-xs font-semibold text-[#878787]">ORDER ID</div>
                <div className="mt-1 font-mono text-sm font-semibold text-slate-900">{orderId}</div>
                <div className="mt-3 text-sm text-slate-700">
                  You can track your order from your profile once tracking is available.
                </div>
              </div>

              <ItemThumbs items={items} />

              {createdAt && deliveryDate ? <Timeline steps={computeTimeline(createdAt, deliveryDate)} /> : null}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-sm bg-[#2874f0] px-4 py-3 text-sm font-bold text-white hover:bg-[#1e60d6]"
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-sm border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  View More Deals
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
