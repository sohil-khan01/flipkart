import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';
import placeholderImg from '../assets/product-placeholder.svg';

const CatalogContext = createContext(null);

function normalizeDbProduct(p) {
  if (!p) return null;
  return {
    id: p._id,
    title: p.title,
    category: p.category,
    price: p.price,
    mrp: p.mrp,
    discountPercent: p.discountPercent,
    rating: p.rating ?? 4.0,
    ratingCount: p.ratingCount ?? 0,
    images: Array.isArray(p.images) && p.images.length ? p.images : [placeholderImg],
    highlights: Array.isArray(p.highlights) ? p.highlights : [],
    specs: p.specs && typeof p.specs === 'object' ? p.specs : {},
    offers: Array.isArray(p.offers) ? p.offers : [],
  };
}

export function CatalogProvider({ children }) {
  const [remoteProducts, setRemoteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await api.get('/api/products');
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        const normalized = list.map(normalizeDbProduct).filter(Boolean);
        if (active) setRemoteProducts(normalized);
      } catch {
        if (active) setRemoteProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const allProducts = useMemo(() => {
    return remoteProducts;
  }, [remoteProducts]);

  const getById = (id) => {
    return allProducts.find((p) => p.id === id) || null;
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/products');
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setRemoteProducts(list.map(normalizeDbProduct).filter(Boolean));
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({ products: allProducts, loading, getById, refresh }),
    [allProducts, loading]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}
