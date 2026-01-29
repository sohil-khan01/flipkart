import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { formatINR } from '../data/products';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import { api } from '../utils/api';
import QRCode from 'qrcode';

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
  const delivery = subtotal > 499 ? 0 : lines.length > 0 ? 0 : 0;
  const total = subtotal + delivery;
  const savings = Math.max(0, totalDiscount - delivery);

  const upiVpa = (import.meta.env.VITE_UPI_VPA || '').trim();
  const upiPayeeName = (import.meta.env.VITE_UPI_PAYEE_NAME || 'Flipkart').trim();

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    address: '',
    payment: 'upi',
  });

  const [checkoutStep, setCheckoutStep] = useState('address');
  const [hydrated, setHydrated] = useState(false);

  const [upiAttemptRef] = useState(() => `FK-${Date.now()}`);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [paymentStage, setPaymentStage] = useState('idle');
  const [secondsLeft, setSecondsLeft] = useState(120);

  const ua = navigator?.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isDesktop = !isIOS && !isAndroid;
  const showQrFlow = true;

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrVisible, setQrVisible] = useState(false);

  const storageKey = 'fk_upi_payment_state_v1';
  const checkoutStorageKey = 'fk_checkout_state_v1';

  const readPersisted = (key) => {
    try {
      const v = localStorage.getItem(key);
      if (v != null) return v;
    } catch {
      // ignore
    }
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const writePersisted = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // ignore
    }
  };

  const removePersisted = (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  };

  const addressComplete =
    String(form.name || '').trim() && String(form.mobile || '').trim() && String(form.address || '').trim();

  const formatTimer = (sec) => {
    const s = Math.max(0, Number(sec || 0));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const startWaiting = () => {
    if (!addressComplete) return;
    setPaymentInitiated(true);
    setPaymentStage('waiting');
    setSecondsLeft(120);
    try {
      writePersisted(storageKey, JSON.stringify({ startedAt: Date.now() }));
    } catch {
      // ignore
    }
  };

  const resetPayment = () => {
    setPaymentInitiated(false);
    setPaymentStage('idle');
    setSecondsLeft(120);
    setQrVisible(false);
    try {
      removePersisted(storageKey);
    } catch {
      // ignore
    }
  };

  const goToAddress = () => {
    resetPayment();
    setCheckoutStep('address');
    setError('');
    try {
      const raw = readPersisted(checkoutStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      writePersisted(checkoutStorageKey, JSON.stringify({ ...parsed, step: 'address' }));
    } catch {
      // ignore
    }
  };

  const goToPayment = () => {
    if (!addressComplete) {
      setError('Please fill delivery address details first.');
      return;
    }
    setCheckoutStep('payment');
    setError('');
    try {
      const raw = readPersisted(checkoutStorageKey);
      const parsed = raw ? JSON.parse(raw) : {};
      writePersisted(checkoutStorageKey, JSON.stringify({ ...parsed, step: 'payment' }));
    } catch {
      // ignore
    }
  };

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const buildUpiUrl = ({ ref }) => {
    const vpa = upiVpa;
    if (!vpa) return '';
    const params = new URLSearchParams({
      pa: vpa,
      pn: upiPayeeName,
      am: String(Number(total || 0).toFixed(2)),
      cu: 'INR',
      tn: `Order ${ref}`,
      tr: String(ref || ''),
    });
    return `upi://pay?${params.toString()}`;
  };

  const upiUrlForQr = useMemo(() => (upiVpa ? buildUpiUrl({ ref: upiAttemptRef }) : ''), [upiAttemptRef, upiVpa, upiPayeeName, total]);

  useEffect(() => {
    let active = true;
    async function makeQr() {
      if (!showQrFlow || !qrVisible || checkoutStep !== 'payment') {
        setQrDataUrl('');
        return;
      }
      if (!upiUrlForQr) {
        setQrDataUrl('');
        return;
      }
      try {
        const url = await QRCode.toDataURL(upiUrlForQr, { margin: 1, width: 320 });
        if (active) setQrDataUrl(url);
      } catch {
        if (active) setQrDataUrl('');
      }
    }
    makeQr();
    return () => {
      active = false;
    };
  }, [checkoutStep, qrVisible, showQrFlow, upiUrlForQr]);

  useEffect(() => {
    try {
      const raw = readPersisted(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const startedAt = Number(parsed?.startedAt || 0);
      if (!startedAt) return;
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const remaining = Math.max(0, 120 - elapsed);
      setPaymentInitiated(true);
      if (remaining > 0) {
        setPaymentStage('waiting');
        setSecondsLeft(remaining);
      } else {
        setPaymentStage('ask');
        setSecondsLeft(0);
      }
      try {
        writePersisted(storageKey, raw);
      } catch {
        // ignore
      }
    } catch {
      // ignore
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const raw = readPersisted(checkoutStorageKey);
      if (!raw) {
        setHydrated(true);
        return;
      }
      const parsed = JSON.parse(raw);
      const savedForm = parsed?.form;
      if (savedForm && typeof savedForm === 'object') {
        setForm((p) => ({
          ...p,
          name: typeof savedForm.name === 'string' ? savedForm.name : p.name,
          mobile: typeof savedForm.mobile === 'string' ? savedForm.mobile : p.mobile,
          address: typeof savedForm.address === 'string' ? savedForm.address : p.address,
          payment: 'upi',
        }));
      }

      const step = String(parsed?.step || 'address');
      const canGoPayment =
        String(savedForm?.name || '').trim() && String(savedForm?.mobile || '').trim() && String(savedForm?.address || '').trim();
      if (step === 'payment' && canGoPayment) {
        setCheckoutStep('payment');
        setQrVisible(Boolean(parsed?.qrVisible));
      } else {
        setCheckoutStep('address');
        setQrVisible(false);
      }

      try {
        writePersisted(checkoutStorageKey, raw);
      } catch {
        // ignore
      }
    } catch {
      // ignore
    }

    setHydrated(true);
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      writePersisted(
        checkoutStorageKey,
        JSON.stringify({
          step: checkoutStep,
          form: { name: form.name, mobile: form.mobile, address: form.address },
          qrVisible: Boolean(qrVisible),
        })
      );
    } catch {
      // ignore
    }
  }, [checkoutStep, form.name, form.mobile, form.address, qrVisible]);

  useEffect(() => {
    if (paymentStage !== 'waiting') return undefined;
    const id = window.setInterval(() => {
      setSecondsLeft((p) => {
        const next = Math.max(0, Number(p || 0) - 1);
        if (next === 0) setPaymentStage('ask');
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [paymentStage]);

  const buildAndroidIntentUrl = ({ ref, packageName }) => {
    if (!packageName) return '';
    const vpa = upiVpa;
    if (!vpa) return '';
    const params = new URLSearchParams({
      pa: vpa,
      pn: upiPayeeName,
      am: String(Number(total || 0).toFixed(2)),
      cu: 'INR',
      tn: `Order ${ref}`,
      tr: String(ref || ''),
    });

    return `intent://pay?${params.toString()}#Intent;scheme=upi;package=${packageName};end`;
  };

  const openUpiApp = (app) => {
    if (!upiVpa) return;
    if (!addressComplete) return;
    const ua = navigator?.userAgent || '';
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);

    const packageMap = {
      phonepe: 'com.phonepe.app',
      paytm: 'net.one97.paytm',
      gpay: 'com.google.android.apps.nbu.paisa.user',
    };

    const pkg = packageMap[String(app || '').toLowerCase()] || '';
    const intentUrl = isAndroid && pkg ? buildAndroidIntentUrl({ ref: upiAttemptRef, packageName: pkg }) : '';
    const upiUrl = buildUpiUrl({ ref: upiAttemptRef });
    const targetUrl = (isIOS ? upiUrl : intentUrl || upiUrl);

    if (targetUrl) {
      startWaiting();
      window.location.href = targetUrl;
    }
  };

  const copyText = async (text) => {
    const value = String(text || '');
    if (!value) return false;
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return false;
    }
  };

  const shareUpiLink = async () => {
    if (!upiVpa) return;
    const upiUrl = buildUpiUrl({ ref: upiAttemptRef });
    if (!upiUrl) return;
    setPaymentInitiated(true);

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Pay via UPI', text: 'Pay via UPI', url: upiUrl });
        return;
      }
    } catch {
      // ignore
    }

    await copyText(upiUrl);
  };

  const placeOrder = async ({ forcePaid } = {}) => {
    if (placing || lines.length === 0) return;
    if (!upiVpa) {
      setError('UPI VPA is not configured.');
      return;
    }

    if (checkoutStep !== 'payment') {
      setError('Please continue to payment first.');
      return;
    }

    if (!addressComplete) {
      setError('Please fill delivery address details first.');
      return;
    }

    if (!paymentInitiated) {
      setError('Please start the payment process first.');
      return;
    }

    if (!forcePaid && paymentStage !== 'paid') {
      setError('Please confirm you completed the payment.');
      return;
    }
    setError('');
    setPlacing(true);

    try {
      const res = await api.post('/api/orders', {
        customer: {
          name: form.name,
          mobile: form.mobile,
          address: form.address,
        },
        payment: 'upi',
        items: lines.map((l) => ({
          productId: l.product.id,
          title: l.product.title,
          image: Array.isArray(l.product.images)
            ? (l.product.images.find((s) => typeof s === 'string' && s.trim()) || '')
            : '',
          price: l.product.price,
          qty: l.qty,
        })),
        subtotal,
        delivery,
        total,
      });

      const orderId = res?.data?.data?.orderId || 'ORD-DEMO';
      clear();
      try {
        removePersisted(storageKey);
        removePersisted(checkoutStorageKey);
      } catch {
        // ignore
      }
      navigate(`/success?orderId=${encodeURIComponent(orderId)}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const submitter = e?.nativeEvent?.submitter;
    if (!submitter || submitter?.dataset?.action !== 'place-order') return;
    await placeOrder();
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

                    {checkoutStep === 'address' ? (
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
                      <div className="mt-5 flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            goToPayment();
                          }}
                          disabled={!addressComplete}
                          className="inline-flex h-11 items-center justify-center rounded-sm bg-[#2874f0] px-5 text-sm font-bold text-white hover:bg-[#1e60d6] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Continue to Payment
                        </button>
                      </div>
                    </div>
                    ) : null}

                    {checkoutStep === 'payment' ? (
                      <div className="border-t border-[#f0f0f0] px-6 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2874f0] text-xs font-bold text-white">
                            2
                          </div>
                          <div className="text-sm font-semibold text-slate-900">Payment Options</div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            goToAddress();
                          }}
                          className="text-xs font-bold text-[#2874f0] hover:underline"
                        >
                          Back
                        </button>
                      </div>

                      <div className="mt-4 grid gap-2">
                        <div className="rounded-sm border border-slate-200 px-3 py-3 text-sm">
                          <div className="font-semibold text-slate-900">UPI</div>
                          <div className="mt-1 text-xs text-slate-600">Choose an app to pay via UPI</div>

                          {!upiVpa ? (
                            <div className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                              UPI VPA not configured. Set <span className="font-bold">VITE_UPI_VPA</span> in frontend env.
                            </div>
                          ) : null}

                          {isAndroid || isIOS ? (
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openUpiApp('phonepe');
                                }}
                                disabled={placing || !upiVpa}
                                className="flex h-11 items-center justify-center rounded-sm border border-slate-200 bg-white text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                PhonePe
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openUpiApp('paytm');
                                }}
                                disabled={placing || !upiVpa}
                                className="flex h-11 items-center justify-center rounded-sm border border-slate-200 bg-white text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Paytm
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openUpiApp('gpay');
                                }}
                                disabled={placing || !upiVpa}
                                className="flex h-11 items-center justify-center rounded-sm border border-slate-200 bg-white text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Google Pay
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openUpiApp('any');
                                }}
                                disabled={placing || !upiVpa}
                                className="flex h-11 items-center justify-center rounded-sm border border-slate-200 bg-white text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Any UPI App
                              </button>
                            </div>
                          ) : null}

                          {isAndroid || isIOS ? (
                            <div className="mt-3">
                              {paymentStage === 'waiting' ? (
                                <div className="rounded border border-slate-200 bg-slate-50 px-3 py-3">
                                  <div className="text-xs font-bold text-slate-700">Waiting for payment... ({formatTimer(secondsLeft)})</div>
                                </div>
                              ) : null}

                              {paymentStage === 'ask' ? (
                                <div className="rounded border border-slate-200 bg-white px-3 py-3">
                                  <div className="text-xs font-bold text-slate-900">Did you complete the payment?</div>
                                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                    <button
                                      type="button"
                                      onClick={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setPaymentStage('paid');
                                        await placeOrder({ forcePaid: true });
                                      }}
                                      disabled={placing}
                                      className="flex h-10 items-center justify-center rounded-sm bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      YES, I PAID
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setPaymentStage('not_paid');
                                      }}
                                      disabled={placing}
                                      className="flex h-10 items-center justify-center rounded-sm border border-slate-200 bg-white text-xs font-bold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      NO
                                    </button>
                                  </div>
                                </div>
                              ) : null}

                              {paymentStage === 'not_paid' ? (
                                <div className="rounded border border-red-200 bg-red-50 px-3 py-3">
                                  <div className="text-xs font-bold text-red-700">Payment not completed</div>
                                  <div className="mt-1 text-xs text-red-700">Please try again</div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      resetPayment();
                                    }}
                                    disabled={placing}
                                    className="mt-2 flex h-9 w-full items-center justify-center rounded-sm border border-red-200 bg-white text-xs font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Try again
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          ) : null}

                          {showQrFlow ? (
                            <div className="mt-3 rounded border border-slate-200 bg-white p-3">
                              <div className="text-xs font-bold text-slate-600">Scan & Pay</div>
                              <div className="mt-1 text-xs text-slate-600">Scan this QR from any UPI app and pay.</div>

                              {!qrVisible ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setQrVisible(true);
                                  }}
                                  className="mt-3 flex h-10 w-full items-center justify-center rounded-sm border border-slate-200 bg-white text-xs font-bold text-slate-900 hover:bg-slate-50"
                                >
                                  Show QR
                                </button>
                              ) : null}

                              {qrVisible && qrDataUrl ? (
                                <div className="mt-3 flex justify-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!paymentInitiated || paymentStage === 'idle') startWaiting();
                                    }}
                                    className="rounded"
                                  >
                                    <img
                                      src={qrDataUrl}
                                      alt="UPI QR"
                                      className="h-48 w-48 rounded border border-slate-200"
                                    />
                                  </button>
                                </div>
                              ) : qrVisible ? (
                                <div className="mt-3 rounded bg-slate-50 p-3 text-center text-xs text-slate-600">
                                  QR not available
                                </div>
                              ) : null}

                              <div className="mt-3">
                                {paymentStage === 'idle' && paymentInitiated ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      startWaiting();
                                    }}
                                    disabled={placing || !upiVpa}
                                    className="flex h-10 w-full items-center justify-center rounded-sm border border-slate-200 bg-white text-xs font-bold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    I have paid (Start timer)
                                  </button>
                                ) : null}

                                {paymentStage === 'waiting' ? (
                                  <div className="rounded border border-slate-200 bg-slate-50 px-3 py-3">
                                    <div className="text-xs font-bold text-slate-700">Waiting for payment... ({formatTimer(secondsLeft)})</div>
                                  </div>
                                ) : null}

                                {paymentStage === 'ask' ? (
                                  <div className="rounded border border-slate-200 bg-white px-3 py-3">
                                    <div className="text-xs font-bold text-slate-900">Did you complete the payment?</div>
                                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                      <button
                                        type="button"
                                        onClick={async (e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setPaymentStage('paid');
                                          await placeOrder({ forcePaid: true });
                                        }}
                                        disabled={placing}
                                        className="flex h-10 items-center justify-center rounded-sm bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        YES, I PAID
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setPaymentStage('not_paid');
                                        }}
                                        disabled={placing}
                                        className="flex h-10 items-center justify-center rounded-sm border border-slate-200 bg-white text-xs font-bold text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        NO
                                      </button>
                                    </div>
                                  </div>
                                ) : null}

                                {paymentStage === 'not_paid' ? (
                                  <div className="rounded border border-red-200 bg-red-50 px-3 py-3">
                                    <div className="text-xs font-bold text-red-700">Payment not completed</div>
                                    <div className="mt-1 text-xs text-red-700">Please try again</div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        resetPayment();
                                      }}
                                      disabled={placing}
                                      className="mt-2 flex h-9 w-full items-center justify-center rounded-sm border border-red-200 bg-white text-xs font-bold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      Try again
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    ) : null}

                    {checkoutStep === 'payment' ? (
                      <div className="sticky bottom-0 z-10 border-t border-[#f0f0f0] bg-white px-6 py-4 shadow-[0_-2px_10px_0_rgba(0,0,0,0.10)]">
                        <button
                          type="submit"
                          disabled={placing || !upiVpa || !paymentInitiated || paymentStage !== 'paid'}
                          data-action="place-order"
                          className="ml-auto flex h-[51px] w-full items-center justify-center rounded-sm bg-[#fb641b] text-sm font-semibold text-white hover:bg-[#ff6f2d] disabled:cursor-not-allowed disabled:opacity-60 sm:w-[250px]"
                        >
                          {placing ? 'Placing order…' : 'Place Order'}
                        </button>
                      </div>
                    ) : null}
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
