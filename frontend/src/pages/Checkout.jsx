import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { formatINR } from '../data/products';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { api } from '../utils/api';

export default function Checkout() {
  const { items, clear } = useCart();
  const { getById } = useCatalog();
  const navigate = useNavigate();

  const lines = useMemo(() => {
    return items
      .map((i) => {
        const p = getById(i.productId);
        if (!p) return null;
        return { product: p, qty: i.qty };
      })
      .filter(Boolean);
  }, [getById, items]);

  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.product.price * l.qty, 0), [lines]);
  const totalMrp = useMemo(() => {
    return lines.reduce((sum, l) => sum + (Number(l.product.mrp || l.product.price || 0) * l.qty), 0);
  }, [lines]);
  const totalDiscount = useMemo(() => Math.max(0, totalMrp - subtotal), [totalMrp, subtotal]);
  const delivery = subtotal > 499 ? 0 : lines.length > 0 ? 49 : 0;
  const total = subtotal + delivery;
  const savings = Math.max(0, totalDiscount - delivery);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    address: '',
    payment: 'cod',
  });

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (lines.length === 0) return;
    setError('');
    setPlacing(true);

    try {
      const res = await api.post('/api/orders', {
        customer: {
          name: form.name,
          mobile: form.mobile,
          address: form.address,
        },
        payment: form.payment,
        items: lines.map((l) => ({
          productId: l.product.id,
          title: l.product.title,
          image: Array.isArray(l.product.images) ? (l.product.images.find((s) => typeof s === 'string' && s.trim()) || '') : '',
          price: l.product.price,
          qty: l.qty,
        })),
        subtotal,
        delivery,
        total,
      });

      const orderId = res?.data?.data?.orderId;
      clear();
      navigate(`/success?orderId=${encodeURIComponent(orderId || 'ORD-DEMO')}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Layout>
      <section className="bg-[#f1f3f6]">
        <div className="mx-auto max-w-7xl px-0 py-4 sm:px-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="w-full">
              <div className="bg-white shadow-sm">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="text-lg font-semibold text-slate-900">Checkout</div>
                  <Link to="/cart" className="text-sm font-semibold text-[#2874f0] hover:underline">
                    Back to cart
                  </Link>
                </div>

                {lines.length === 0 ? (
                  <div className="px-6 pb-6">
                    <div className="mt-2 rounded bg-slate-50 p-6 text-center">
                      <div className="text-sm font-semibold text-slate-900">No items to checkout</div>
                      <div className="mt-1 text-sm text-slate-600">Add products to cart first.</div>
                      <Link
                        to="/"
                        className="mt-4 inline-flex rounded-sm bg-[#2874f0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e60d6]"
                      >
                        Browse products
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="px-0 pb-0">
                    {error ? (
                      <div className="mx-6 mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                      </div>
                    ) : null}

                    <div className="border-t border-[#f0f0f0] px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2874f0] text-xs font-bold text-white">
                          1
                        </div>
                        <div className="text-sm font-semibold text-slate-900">Delivery Address</div>
                      </div>

                      <div className="mt-4 grid gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-600">Name</label>
                          <input
                            value={form.name}
                            onChange={(e) => setField('name', e.target.value)}
                            required
                            className="mt-1 h-11 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2874f0]"
                            placeholder="Full name"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Mobile number</label>
                          <input
                            value={form.mobile}
                            onChange={(e) => setField('mobile', e.target.value)}
                            required
                            className="mt-1 h-11 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2874f0]"
                            placeholder="10-digit mobile"
                            inputMode="numeric"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Address</label>
                          <textarea
                            value={form.address}
                            onChange={(e) => setField('address', e.target.value)}
                            required
                            className="mt-1 min-h-28 w-full resize-none rounded-sm border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#2874f0]"
                            placeholder="House no, street, area, city, state, pincode"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[#f0f0f0] px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2874f0] text-xs font-bold text-white">
                          2
                        </div>
                        <div className="text-sm font-semibold text-slate-900">Payment Options</div>
                      </div>

                      <div className="mt-4 grid gap-2">
                        <label className="flex cursor-pointer items-center gap-2 rounded-sm border border-slate-200 px-3 py-3 text-sm">
                          <input
                            type="radio"
                            name="payment"
                            checked={form.payment === 'cod'}
                            onChange={() => setField('payment', 'cod')}
                          />
                          <div className="font-semibold text-slate-900">Cash on Delivery</div>
                        </label>
                        <label className="flex cursor-pointer items-center gap-2 rounded-sm border border-slate-200 px-3 py-3 text-sm">
                          <input
                            type="radio"
                            name="payment"
                            checked={form.payment === 'upi'}
                            onChange={() => setField('payment', 'upi')}
                          />
                          <div className="font-semibold text-slate-900">UPI (placeholder)</div>
                        </label>
                      </div>
                    </div>

                    <div className="sticky bottom-0 z-10 border-t border-[#f0f0f0] bg-white px-6 py-4 shadow-[0_-2px_10px_0_rgba(0,0,0,0.10)]">
                      <button
                        type="submit"
                        disabled={placing}
                        className="ml-auto flex h-[51px] w-full items-center justify-center rounded-sm bg-[#fb641b] text-sm font-semibold text-white hover:bg-[#ff6f2d] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[250px]"
                      >
                        {placing ? 'Placing order…' : 'Pay & Place Order'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="w-full">
              <div className="bg-white shadow-sm">
                <div className="border-b border-[#f0f0f0] px-6 py-4">
                  <div className="text-sm font-semibold text-[#878787]">PRICE DETAILS</div>
                </div>

                <div className="px-6 py-4 text-sm text-slate-900">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>Price ({lines.length} item)</div>
                      <div>{formatINR(totalMrp || subtotal)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Discount</div>
                      <div className="text-[#388E3C]">- {formatINR(totalDiscount)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>Delivery Charges</div>
                      <div>{delivery === 0 ? 'FREE' : formatINR(delivery)}</div>
                    </div>
                  </div>

                  <div className="my-5 border-t border-dashed border-slate-300" />

                  <div className="flex items-center justify-between text-base font-semibold">
                    <div>Total Amount</div>
                    <div>{formatINR(total)}</div>
                  </div>

                  <div className="my-5 border-t border-dashed border-slate-300" />

                  <div className="text-sm font-semibold text-[#388E3C]">
                    You will save {formatINR(savings)} on this order
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
