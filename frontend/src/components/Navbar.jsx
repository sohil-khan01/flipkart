import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCatalog } from '../context/CatalogContext';

const LOGO_URL = 'https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/flipkart-plus_8d85f4.png';
const PLUS_URL = 'https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/plus_aef861.png';

function MenuIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Badge({ value }) {
  if (!value) return null;
  return (
    <span className="-ml-2 -mt-3 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff6161] px-1 text-xs font-bold text-white">
      {value}
    </span>
  );
}

function CartIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 7H20L19 14H7L6 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6 7L5.4 4.6C5.2 3.8 4.5 3.2 3.6 3.2H2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const { count } = useCart();
  const { products } = useCatalog();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initial = searchParams.get('q') || '';
  const [q, setQ] = useState(initial);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [open, setOpen] = useState(false);
  const searchWrapRef = useRef(null);

  const cartLabel = useMemo(() => (count > 0 ? String(count) : ''), [count]);

  const onSubmit = (e) => {
    e.preventDefault();
    const next = q.trim();
    setShowSuggestions(false);
    navigate(next ? `/?q=${encodeURIComponent(next)}` : '/');
  };

  const closeDrawer = () => setOpen(false);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (!searchWrapRef.current) return;
      if (searchWrapRef.current.contains(e.target)) return;
      setShowSuggestions(false);
    };

    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const suggestions = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return [];
    return products
      .filter((p) => String(p?.title || '').toLowerCase().includes(text))
      .slice(0, 8);
  }, [products, q]);

  return (
    <header className="sticky top-0 z-50 bg-[#2874f0]">
      <div className="mx-auto flex h-[55px] max-w-[1320px] items-center gap-3 px-3 sm:px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded text-white hover:bg-white/10 sm:hidden"
          aria-label="Open menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>

        <Link to="/" className="flex shrink-0 flex-col leading-none text-white no-underline sm:ml-[12%]">
          <img src={LOGO_URL} alt="" className="h-[20px] w-[75px]" />
          <div className="mt-0.5 hidden items-center gap-1 sm:flex">
            <span className="text-[10px] italic text-white/90">Explore</span>
            <span className="text-[10px] italic text-[#ffe500]">Plus</span>
            <img src={PLUS_URL} alt="" className="h-[10px] w-[10px]" />
          </div>
        </Link>

        <form onSubmit={onSubmit} className="flex flex-1 items-center">
          <div ref={searchWrapRef} className="relative w-full">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setShowSuggestions(true);
              }}
              placeholder="Search for products, brands and more"
              className="h-10 w-full rounded-sm bg-white px-3 pr-10 text-sm outline-none placeholder:text-slate-400"
              aria-label="Search"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-[#2874f0]"
              aria-label="Search"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {showSuggestions && suggestions.length ? (
              <div className="absolute left-0 right-0 top-[44px] z-50 overflow-hidden rounded-sm bg-white shadow">
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    onClick={() => setShowSuggestions(false)}
                    className="block px-3 py-2 text-sm text-slate-800 hover:bg-slate-50"
                  >
                    {p.title}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </form>

        <div className="ml-auto hidden items-center sm:flex">
          <button
            type="button"
            className="h-8 rounded-sm bg-white px-10 text-sm font-semibold text-[#2874f0] hover:bg-white/95"
          >
            Login
          </button>

          <button
            type="button"
            className="ml-[50px] text-xs font-medium text-white hover:underline"
          >
            More
          </button>

          <Link
            to="/track"
            className="ml-[50px] text-xs font-medium text-white hover:underline"
          >
            Track Order
          </Link>

          <Link
            to="/cart"
            className="ml-[50px] flex items-center gap-2 text-xs font-medium text-white hover:underline"
          >
            <div className="relative flex items-center">
              <CartIcon className="h-6 w-6" />
              <div className="absolute -right-1 -top-1">
                <Badge value={cartLabel} />
              </div>
            </div>
            <span className="text-sm font-medium">Cart</span>
          </Link>
        </div>

        <Link to="/cart" className="relative flex items-center gap-2 rounded px-2 py-2 text-white hover:bg-white/10 sm:hidden">
          <CartIcon className="h-6 w-6" />
          {cartLabel ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff6161] px-1 text-xs font-bold text-white">
              {cartLabel}
            </span>
          ) : null}
        </Link>
      </div>

      <div className={open ? 'fixed inset-0 z-[60]' : 'hidden'} aria-hidden={!open}>
        <button type="button" className="absolute inset-0 bg-black/40" onClick={closeDrawer} aria-label="Close menu" />
        <div className="absolute left-0 top-0 h-full w-[250px] bg-white shadow-xl">
          <div className="flex h-[55px] items-center bg-[#2874f0] px-4 text-white">
            <div className="text-sm font-bold">Menu</div>
          </div>
          <div className="p-3">
            <button
              type="button"
              className="w-full rounded-sm bg-[#2874f0] px-4 py-3 text-sm font-bold text-white"
              onClick={closeDrawer}
            >
              Login
            </button>
            <button
              type="button"
              className="mt-2 w-full rounded-sm border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#2874f0]"
              onClick={closeDrawer}
            >
              Become a Seller
            </button>
            <button
              type="button"
              className="mt-2 w-full rounded-sm border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#2874f0]"
              onClick={closeDrawer}
            >
              More
            </button>

            <Link
              to="/track"
              onClick={closeDrawer}
              className="mt-2 block w-full rounded-sm border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-[#2874f0]"
            >
              Track Order
            </Link>
            <Link
              to="/cart"
              onClick={closeDrawer}
              className="mt-2 flex w-full items-center justify-between rounded-sm border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#2874f0]"
            >
              <span>Cart</span>
              {cartLabel ? <span className="text-xs font-bold text-[#ff6161]">{cartLabel}</span> : null}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
