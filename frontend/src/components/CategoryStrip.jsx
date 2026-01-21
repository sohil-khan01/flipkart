import React from 'react';
import { categories } from '../data/products';

export default function CategoryStrip({ activeCategory, onSelectCategory }) {
  return (
    <section className="bg-white shadow-sm">
      <div className="mx-auto max-w-[1320px] px-3 py-2 sm:px-4">
        <div className="flex items-center gap-3 overflow-x-auto py-2">
          <button
            type="button"
            onClick={() => onSelectCategory?.('')}
            className={`flex min-w-[96px] flex-col items-center rounded-md px-3 py-2 text-[13px] font-medium transition sm:min-w-[110px] ${
              !activeCategory ? 'bg-[#eaf2ff] text-[#2874f0]' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl sm:h-14 sm:w-14 sm:text-2xl">
              🧭
            </div>
            <div className="mt-1.5">All</div>
          </button>

          {categories.map((c) => {
            const active = c.id === activeCategory;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCategory?.(c.id)}
                className={`flex min-w-[96px] flex-col items-center rounded-md px-3 py-2 text-[13px] font-medium transition sm:min-w-[110px] ${
                  active ? 'bg-[#eaf2ff] text-[#2874f0]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl sm:h-14 sm:w-14 sm:text-2xl">
                  {c.iconText}
                </div>
                <div className="mt-1.5 whitespace-nowrap">{c.name}</div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
