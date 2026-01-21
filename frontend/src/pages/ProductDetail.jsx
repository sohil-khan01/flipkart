import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { formatINR } from '../data/products';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import placeholderImg from '../assets/product-placeholder.svg';

const FALLBACK_IMG = placeholderImg;

function computeDeliveryDateFromId(id) {
  const s = String(id || "");
  let sum = 0;
  for (let i = 0; i < s.length; i += 1) sum = (sum + s.charCodeAt(i)) % 1000;
  const days = 3 + (sum % 2);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function RatingPill({ rating }) {
  const bg = rating >= 4.2 ? 'bg-emerald-600' : rating >= 3.6 ? 'bg-green-600' : 'bg-amber-600';
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-bold text-white ${bg}`}>
      {rating.toFixed(1)}
      <span className="text-[10px]">★</span>
    </span>
  );
}

function TagIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.5 11.6V4.9c0-.8.7-1.5 1.5-1.5h6.7c.4 0 .8.2 1.1.4l7.4 7.4c.6.6.6 1.6 0 2.2l-6 6c-.6.6-1.6.6-2.2 0l-7.4-7.4c-.3-.3-.4-.7-.4-1.1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8 8.2h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function SpecTable({ specs }) {
  const entries = Object.entries(specs || {});
  if (entries.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <div className="grid grid-cols-1">
        {entries.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[140px_1fr] border-b border-slate-200">
            <div className="bg-slate-50 px-4 py-3 text-sm text-[#878787]">{k}</div>
            <div className="px-4 py-3 text-sm text-slate-700">{String(v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { getById } = useCatalog();
  const product = useMemo(() => getById(id), [getById, id]);
  const [activeIndex, setActiveIndex] = useState(0);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const images = (product?.images || []).filter((s) => typeof s === 'string' && s.trim());
  const safeImages = images.length ? images : [FALLBACK_IMG];
  const safeIndex = Math.min(Math.max(activeIndex, 0), safeImages.length - 1);
  const activeImage = safeImages[safeIndex] || FALLBACK_IMG;

  if (!product) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="rounded-md bg-white p-6 text-sm text-slate-700 shadow-sm">Product not found.</div>
        </div>
      </Layout>
    );
  }

  const onAdd = () => {
    addToCart(product.id, 1);
    navigate('/cart');
  };

  const onBuyNow = () => {
    addToCart(product.id, 1);
    navigate('/checkout');
  };

  const fassured = 'https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/fa_62673a.png';
  const deliveryDate = computeDeliveryDateFromId(product.id);
  const adURL = 'https://rukminim1.flixcart.com/lockin/774/185/images/CCO__PP_2019-07-14.png?q=50';

  return (
    <Layout>
      <section className="bg-[#f1f3f6]">
        <div className="mx-auto max-w-7xl px-0 py-4 sm:px-4">
          <div className="bg-white shadow-sm lg:h-[calc(100vh-96px)]">
            <div className="grid gap-0 lg:grid-cols-[42%_1fr]">
              <div className="px-4 pb-4 pt-4 sm:px-6 sm:pt-6 lg:pb-6 lg:h-full lg:sticky lg:top-4 lg:self-start">
                <div className="grid gap-3 sm:grid-cols-[76px_1fr]">
                  <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
                    {safeImages.map((src, i) => {
                      const active = i === safeIndex;
                      return (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setActiveIndex(i)}
                          className={`h-16 w-16 overflow-hidden rounded border bg-slate-50 transition ${
                            active ? 'border-[#2874f0]' : 'border-slate-200 hover:border-slate-300'
                          }`}
                          aria-label={`Select image ${i + 1}`}
                        >
                          <img
                            src={src}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_IMG;
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="order-1 overflow-hidden border border-[#f0f0f0] bg-white sm:order-2">
                    <div className="aspect-square p-4">
                      <img
                        src={activeImage}
                        alt={product.title}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMG;
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={onAdd}
                    className="flex h-[50px] items-center justify-center gap-2 rounded-sm bg-[#ff9f00] px-4 text-sm font-semibold text-white hover:bg-[#ffb43b]"
                  >
                    <span className="text-base">🛒</span>
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={onBuyNow}
                    className="flex h-[50px] items-center justify-center gap-2 rounded-sm bg-[#fb641b] px-4 text-sm font-semibold text-white hover:bg-[#ff6f2d]"
                  >
                    <span className="text-base">⚡</span>
                    Buy Now
                  </button>
                </div>
              </div>

              <div className="px-4 pb-6 pt-4 sm:px-6 sm:pt-6 lg:max-h-[calc(100vh-96px)] lg:overflow-y-auto">
                <h1 className="text-base font-semibold text-slate-900 sm:text-lg">{product.title}</h1>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <RatingPill rating={product.rating} />
                  <div className="text-xs text-[#878787]">
                    {product.ratingCount.toLocaleString('en-IN')} Ratings
                  </div>
                  <img src={fassured} alt="" className="h-4 w-auto" />
                </div>

                <div className="mt-4 flex flex-wrap items-baseline gap-2">
                  <div className="text-2xl font-semibold text-slate-900">{formatINR(product.price)}</div>
                  <div className="text-sm text-[#878787] line-through">{formatINR(product.mrp)}</div>
                  <div className="text-sm font-semibold text-[#388E3C]">{product.discountPercent}% off</div>
                </div>

                <div className="mt-6">
                  <div className="text-sm font-semibold text-slate-900">Available offers</div>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    {product.offers.map((o) => (
                      <div key={o} className="flex gap-2">
                        <TagIcon className="mt-[2px] h-4 w-4 text-[#00CC00]" />
                        <span>{o}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded border border-slate-200">
                  <div className="grid grid-cols-1">
                    <div className="grid grid-cols-[140px_1fr] border-b border-slate-200">
                      <div className="bg-slate-50 px-4 py-3 text-sm text-[#878787]">Delivery</div>
                      <div className="px-4 py-3 text-sm font-semibold text-slate-900">
                        Delivery by {deliveryDate.toDateString()} | ₹40
                      </div>
                    </div>
                    <div className="grid grid-cols-[140px_1fr] border-b border-slate-200">
                      <div className="bg-slate-50 px-4 py-3 text-sm text-[#878787]">Warranty</div>
                      <div className="px-4 py-3 text-sm text-slate-700">No Warranty</div>
                    </div>
                    <div className="grid grid-cols-[140px_1fr]">
                      <div className="bg-slate-50 px-4 py-3 text-sm text-[#878787]">Seller</div>
                      <div className="px-4 py-3 text-sm text-slate-700">
                        <div className="font-semibold text-[#2874f0]">SuperComNet</div>
                        <div className="mt-1 text-sm">GST invoice available</div>
                        <div className="text-sm">View more sellers starting from ₹329</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded border border-slate-200">
                  <img src={adURL} alt="" className="w-full" />
                </div>

                <div className="mt-6 grid gap-6">
                  {product.highlights.length ? (
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Highlights</div>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                        {product.highlights.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div>
                    <div className="text-sm font-semibold text-slate-900">Specifications</div>
                    <div className="mt-2">
                      <SpecTable specs={product.specs} />
                    </div>
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
