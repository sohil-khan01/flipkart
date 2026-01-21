import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { formatINR } from '../data/products';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';
import placeholderImg from '../assets/product-placeholder.svg';

const FALLBACK_IMG = placeholderImg;

function QtyControl({ qty, onDec, onInc }) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onDec}
        className="h-8 w-8 rounded-full border border-slate-300 bg-white text-base font-bold text-slate-700 hover:bg-slate-50"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <div className="w-10 text-center text-sm font-semibold text-slate-900">{qty}</div>
      <button
        type="button"
        onClick={onInc}
        className="h-8 w-8 rounded-full border border-slate-300 bg-white text-base font-bold text-slate-700 hover:bg-slate-50"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function CartItemRow({ line, onDec, onInc, onRemove }) {
  const p = line.product;
  const qty = line.qty;

  const imgSrc = p?.images?.find((s) => typeof s === 'string' && s.trim()) || FALLBACK_IMG;

  const mrp = Number(p.mrp || 0);
  const price = Number(p.price || 0);
  const hasDiscount = mrp > 0 && price > 0 && mrp > price;
  const discount = hasDiscount ? mrp - price : 0;
  const discountPercent = hasDiscount
    ? Math.round((discount / mrp) * 100)
    : Number.isFinite(Number(p.discountPercent))
      ? Math.round(Number(p.discountPercent))
      : 0;

  const fassured = 'https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/fa_62673a.png';

  return (
    <div className="flex gap-3 border-t border-[#f0f0f0] bg-white px-5 py-5">
      <div className="flex w-[120px] shrink-0 flex-col items-center gap-3">
        <div className="h-[110px] w-[110px] overflow-hidden bg-slate-50">
          <img
            src={imgSrc}
            alt={p.title}
            className="h-full w-full object-contain"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMG;
            }}
          />
        </div>
        <QtyControl qty={qty} onDec={onDec} onInc={onInc} />
      </div>

      <div className="min-w-0 flex-1">
        <Link to={`/product/${p.id}`} className="line-clamp-2 text-sm font-medium text-slate-900 hover:underline">
          {p.title}
        </Link>

        <div className="mt-2 flex items-center gap-2 text-xs text-[#878787]">
          <div>Seller: RetailNet</div>
          <img src={fassured} alt="" className="h-4 w-auto" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="text-lg font-semibold text-slate-900">{formatINR(price)}</div>
          {hasDiscount ? (
            <>
              <div className="text-sm text-[#878787]">
                <strike>{formatINR(mrp)}</strike>
              </div>
              <div className="text-sm font-semibold text-[#388E3C]">{discountPercent}% off</div>
            </>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="mt-5 text-sm font-semibold text-slate-900 hover:text-[#fb641b]"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function EmptyCartView() {
  const imgurl =
    'https://rukminim1.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90';

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
      <div className="mx-auto w-full max-w-4xl bg-white px-6 py-10 shadow-sm sm:px-10">
        <div className="flex flex-col items-center text-center">
          <img src={imgurl} alt="" className="w-[140px] sm:w-[160px]" />
          <div className="mt-4 text-base font-semibold text-slate-900">Your cart is empty!</div>
          <div className="mt-1 text-sm text-slate-600">Add items to it now.</div>
          <Link
            to="/"
            className="mt-6 inline-flex h-[44px] items-center justify-center rounded-sm bg-[#2874f0] px-6 text-sm font-semibold text-white hover:bg-[#1e60d6]"
          >
            Shop now
          </Link>
        </div>
      </div>
    </div>
  );
}

function PriceDetails({ lines, subtotal, total, delivery, totalMrp, totalDiscount }) {
  const savings = Math.max(0, totalDiscount - delivery);

  return (
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
  );
}

export default function Cart() {
  const { items, increment, decrement, removeFromCart } = useCart();
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

  const subtotal = useMemo(() => {
    return lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  }, [lines]);

  const totalMrp = useMemo(() => {
    return lines.reduce((sum, l) => sum + (Number(l.product.mrp || l.product.price || 0) * l.qty), 0);
  }, [lines]);

  const totalDiscount = useMemo(() => {
    return Math.max(0, totalMrp - subtotal);
  }, [totalMrp, subtotal]);

  const delivery = subtotal > 499 ? 0 : lines.length > 0 ? 49 : 0;
  const total = subtotal + delivery;

  return (
    <Layout>
      <section className="bg-[#f1f3f6]">
        {lines.length === 0 ? (
          <EmptyCartView />
        ) : (
          <div className="mx-auto max-w-7xl px-0 py-4 sm:px-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
              <div className="w-full">
                <div className="bg-white shadow-sm">
                  <div className="px-6 py-4">
                    <div className="text-lg font-semibold text-slate-900">My Cart ({lines.length})</div>
                  </div>

                  {lines.map((l) => (
                    <CartItemRow
                      key={l.product.id}
                      line={l}
                      onDec={() => decrement(l.product.id)}
                      onInc={() => increment(l.product.id)}
                      onRemove={() => removeFromCart(l.product.id)}
                    />
                  ))}

                  <div className="sticky bottom-0 z-10 border-t border-[#f0f0f0] bg-white px-6 py-4 shadow-[0_-2px_10px_0_rgba(0,0,0,0.10)]">
                    <button
                      type="button"
                      onClick={() => navigate('/checkout')}
                      className="ml-auto flex h-[51px] w-full items-center justify-center rounded-sm bg-[#fb641b] text-sm font-semibold text-white hover:bg-[#ff6f2d] sm:w-[250px]"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <PriceDetails
                  lines={lines}
                  subtotal={subtotal}
                  total={total}
                  delivery={delivery}
                  totalMrp={totalMrp}
                  totalDiscount={totalDiscount}
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
