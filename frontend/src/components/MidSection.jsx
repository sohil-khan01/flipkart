import React from 'react';

const IMAGE_URLS = [
  'https://rukminim1.flixcart.com/flap/960/960/image/2f30db9425df5cec.jpg?q=50',
  'https://rukminim1.flixcart.com/flap/960/960/image/084789479074d2b2.jpg',
  'https://rukminim1.flixcart.com/flap/960/960/image/1ce0c4c1fb501b45.jpg?q=50',
];

const BOTTOM_URL = 'https://rukminim1.flixcart.com/flap/3006/433/image/4789bc3aefd54494.jpg?q=50';

export default function MidSection() {
  return (
    <section className="bg-[#f1f3f6]">
      <div className="mx-auto max-w-[1320px] px-3 pb-0 pt-1 sm:px-4">
        <div className="mt-5 grid gap-3 md:grid-cols-3 md:gap-4">
          {IMAGE_URLS.map((src) => (
            <div key={src} className="overflow-hidden rounded bg-white shadow-sm">
              <img src={src} alt="" className="h-[140px] w-full object-cover md:h-auto" loading="lazy" />
            </div>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded bg-white shadow-sm">
          <img src={BOTTOM_URL} alt="" className="h-[120px] w-full object-cover md:h-auto" loading="lazy" />
        </div>
      </div>
    </section>
  );
}
