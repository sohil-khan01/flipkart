import React, { useEffect, useMemo, useState } from 'react';
import banner1 from '../assets/349d0b763b3c6571.webp';
import banner2 from '../assets/a8f42dd40bde33ac.webp';
import banner3 from '../assets/c0c989aef7e378fd.webp';

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  const banners = useMemo(() => [banner1, banner2, banner3].filter(Boolean), []);
  const safeIndex = banners.length ? ((index % banners.length) + banners.length) % banners.length : 0;

  useEffect(() => {
    if (!banners.length) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 3500);

    return () => window.clearInterval(id);
  }, [banners.length]);

  const prev = () => setIndex((i) => (i - 1 + banners.length) % banners.length);
  const next = () => setIndex((i) => (i + 1) % banners.length);

  return (
    <section className="bg-[#f1f3f6]">
      <div className="mx-auto max-w-[1320px] px-3 py-4 sm:px-4">
        <div className="relative overflow-hidden bg-white shadow-sm">
          <div className="relative h-[180px] bg-white sm:h-[280px]">
            <div
              className="flex h-full w-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${safeIndex * 100}%)` }}
            >
              {banners.map((src) => (
                <div key={src} className="h-full w-full shrink-0">
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={prev}
            className="absolute left-0 top-1/2 flex h-20 w-[50px] -translate-y-1/2 items-center justify-center bg-white text-slate-700 shadow hover:bg-white/95"
            aria-label="Previous slide"
          >
            <span className="text-xl">‹</span>
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-0 top-1/2 flex h-20 w-[50px] -translate-y-1/2 items-center justify-center bg-white text-slate-700 shadow hover:bg-white/95"
            aria-label="Next slide"
          >
            <span className="text-xl">›</span>
          </button>
        </div>
      </div>
    </section>
  );
}
