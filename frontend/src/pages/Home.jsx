import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import CategoryStrip from '../components/CategoryStrip';
import HeroSlider from '../components/HeroSlider';
import MidSection from '../components/MidSection';
import ProductCard from '../components/ProductCard';
import { useCatalog } from '../context/CatalogContext';

const Home = () => {
  const [searchParams] = useSearchParams();
  const { products, loading } = useCatalog();
  const [category, setCategory] = useState('');
  const [visible, setVisible] = useState(products);

  useEffect(() => {
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const next = products.filter((p) => {
      const matchCategory = category ? p.category === category : true;
      const matchQuery = q ? p.title.toLowerCase().includes(q) : true;
      return matchCategory && matchQuery;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(next);
  }, [category, products, searchParams]);

  return (
    <Layout>
      <CategoryStrip activeCategory={category} onSelectCategory={setCategory} />
      <HeroSlider />
      <section className="bg-[#f1f3f6]">
        <div className="mx-auto max-w-[1320px] px-3 py-4 sm:px-4">
          <div className="rounded-md bg-white p-4 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <div className="text-base font-bold text-slate-900">Top Deals For You</div>
                <div className="text-xs text-slate-500">Products are loaded from database (admin added)</div>
              </div>

              {category ? (
                <button
                  type="button"
                  onClick={() => setCategory('')}
                  className="self-start rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:self-auto"
                >
                  Clear Category
                </button>
              ) : null}
            </div>

            {loading ? (
              <div className="mt-6 rounded bg-slate-50 p-6 text-center text-sm text-slate-600">
                Loading products…
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}

            {visible.length === 0 ? (
              <div className="mt-8 rounded bg-slate-50 p-6 text-center text-sm text-slate-600">
                No products found. Add products from the Admin panel.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <MidSection />
    </Layout>
  );
};

export default Home;
