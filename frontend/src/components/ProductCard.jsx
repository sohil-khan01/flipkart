import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatINR } from '../data/products';
import { useCart } from '../context/CartContext';
import placeholderImg from '../assets/product-placeholder.svg';

const FALLBACK_IMG = placeholderImg;

function RatingBadge({ value }) {
  const bg = value >= 4.2 ? 'bg-emerald-600' : value >= 3.6 ? 'bg-green-600' : 'bg-amber-600';
  return (
    <span className={`inline-flex items-center gap-1 rounded px-2 py-[2px] text-xs font-bold text-white ${bg}`}>
      {value.toFixed(1)}
      <span className="text-[10px]">★</span>
    </span>
  );
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const imgSrc = product?.images?.find((s) => typeof s === 'string' && s.trim()) || FALLBACK_IMG;

  const onAdd = (e) => {
    e.preventDefault();
    addToCart(product.id, 1);
  };

  const onBuyNow = (e) => {
    e.preventDefault();
    addToCart(product.id, 1);
    navigate('/checkout');
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex h-full flex-col rounded-md bg-white p-3 shadow-sm transition hover:shadow-md"
    >
      <div className="relative">
        <div className="aspect-square w-full overflow-hidden rounded bg-slate-50">
          <img
            src={imgSrc}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMG;
            }}
          />
        </div>

        <div className="absolute left-2 top-2 flex items-center gap-2">
          <span className="rounded bg-white/90 px-2 py-1 text-[11px] font-bold text-[#2874f0]">
            {product.discountPercent}% OFF
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <div className="line-clamp-2 text-sm font-medium text-slate-900">{product.title}</div>

        <div className="mt-2 flex items-center gap-2">
          <RatingBadge value={product.rating} />
          <span className="text-xs text-slate-500">({product.ratingCount.toLocaleString('en-IN')})</span>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <div className="text-base font-bold text-slate-900">{formatINR(product.price)}</div>
          <div className="text-xs text-slate-500 line-through">{formatINR(product.mrp)}</div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onAdd}
            className="rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={onBuyNow}
            className="rounded-sm bg-[#ff9f00] px-3 py-2 text-xs font-bold text-slate-900 hover:bg-[#ffb43b]"
          >
            Buy Now
          </button>
        </div>
      </div>
    </Link>
  );
}
