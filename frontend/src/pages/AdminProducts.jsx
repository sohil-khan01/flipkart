import React, { useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { categories, formatINR } from '../data/products';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useCatalog } from '../context/CatalogContext';
import { api, authHeaders } from '../utils/api';
import placeholderImg from '../assets/product-placeholder.svg';

export default function AdminProducts() {
  const { token, logout } = useAdminAuth();
  const { refresh } = useCatalog();

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [importJsonFile, setImportJsonFile] = useState(null);
  const [importImageFiles, setImportImageFiles] = useState([]);

  const [form, setForm] = useState({
    title: '',
    category: categories[0]?.id || 'mobiles',
    price: 999,
    mrp: 1299,
    discountPercent: 20,
    rating: 4.2,
    ratingCount: 0,
    images: [],
    highlights: 'High quality\nGreat value\nFast delivery (placeholder)',
    offers: 'Special price (placeholder)\nBank offer (placeholder)',
    specs: 'Brand: Demo\nWarranty: 1 Year',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const parseLines = (value) =>
    String(value || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

  const parseSpecs = (value) => {
    const lines = parseLines(value);
    const obj = {};
    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const k = line.slice(0, idx).trim();
      const v = line.slice(idx + 1).trim();
      if (k) obj[k] = v;
    }
    return obj;
  };

  const readFileText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const normalizeImportProduct = (p) => {
    if (!p || typeof p !== 'object') return null;
    return {
      title: String(p.title || '').trim(),
      category: String(p.category || '').trim(),
      price: Number(p.price || 0),
      mrp: Number(p.mrp || 0),
      discountPercent: Number(p.discountPercent || 0),
      rating: p.rating == null ? 4.0 : Number(p.rating),
      ratingCount: p.ratingCount == null ? 0 : Number(p.ratingCount),
      images: Array.isArray(p.images) ? p.images.filter(Boolean) : [],
      highlights: Array.isArray(p.highlights)
        ? p.highlights.filter(Boolean)
        : typeof p.highlights === 'string'
          ? parseLines(p.highlights)
          : [],
      offers: Array.isArray(p.offers)
        ? p.offers.filter(Boolean)
        : typeof p.offers === 'string'
          ? parseLines(p.offers)
          : [],
      specs:
        p.specs && typeof p.specs === 'object'
          ? p.specs
          : typeof p.specs === 'string'
            ? parseSpecs(p.specs)
            : {},
    };
  };

  const onImportBulk = async () => {
    setImportError('');
    setImportSuccess('');

    if (!importJsonFile) {
      setImportError('Please select a JSON file to import.');
      return;
    }

    setImporting(true);

    try {
      const raw = await readFileText(importJsonFile);
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        setImportError('Invalid JSON file.');
        return;
      }

      const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.products) ? parsed.products : null;
      if (!Array.isArray(list) || list.length === 0) {
        setImportError('JSON must be an array of products (or {"products": [...]})');
        return;
      }

      let nameToUrl = {};
      if (importImageFiles.length) {
        const fd = new FormData();
        for (const f of importImageFiles) fd.append('images', f);
        const res = await api.post('/api/uploads/images', fd, {
          headers: {
            ...authHeaders(token),
            'Content-Type': 'multipart/form-data',
          },
        });

        const items = Array.isArray(res?.data?.data?.items) ? res.data.data.items : [];
        nameToUrl = items.reduce((acc, it) => {
          if (it?.originalName && it?.url) acc[it.originalName] = it.url;
          return acc;
        }, {});
      }

      const resolved = list
        .map(normalizeImportProduct)
        .filter(Boolean)
        .map((p) => {
          const images = (p.images || []).map((img) => {
            if (typeof img !== 'string') return '';
            const trimmed = img.trim();
            if (!trimmed) return '';
            if (trimmed.startsWith('/uploads/')) return trimmed;
            if (nameToUrl[trimmed]) return nameToUrl[trimmed];
            const justName = trimmed.split('/').pop();
            if (justName && nameToUrl[justName]) return nameToUrl[justName];
            return trimmed;
          });
          return { ...p, images: images.filter(Boolean) };
        });

      const invalid = resolved.find((p) => !p.title || !p.category || !Array.isArray(p.images) || p.images.length === 0);
      if (invalid) {
        setImportError('Each product must have title, category, and at least one image.');
        return;
      }

      const createRes = await api.post('/api/products/bulk', { products: resolved }, { headers: authHeaders(token) });
      const count = createRes?.data?.data?.count;
      setImportSuccess(`Imported ${Number(count || resolved.length)} products successfully.`);
      setImportJsonFile(null);
      setImportImageFiles([]);
      await refresh();
    } catch (err) {
      setImportError(err?.response?.data?.message || err?.message || 'Failed to import products');
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        logout();
      }
    } finally {
      setImporting(false);
    }
  };

  const preview = useMemo(() => {
    const images = Array.isArray(form.images) ? form.images : [];
    return {
      title: form.title || 'Preview product title',
      category: form.category,
      price: Number(form.price || 0),
      mrp: Number(form.mrp || 0),
      discountPercent: Number(form.discountPercent || 0),
      rating: Number(form.rating || 0),
      ratingCount: Number(form.ratingCount || 0),
      images,
    };
  }, [form]);

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const onUploadFiles = async () => {
    setUploadError('');
    if (!selectedFiles.length) return;
    setUploading(true);

    try {
      const fd = new FormData();
      for (const f of selectedFiles) fd.append('images', f);

      const res = await api.post('/api/uploads/images', fd, {
        headers: {
          ...authHeaders(token),
          'Content-Type': 'multipart/form-data',
        },
      });

      const urls = Array.isArray(res?.data?.data?.urls) ? res.data.data.urls : [];
      setForm((p) => ({
        ...p,
        images: Array.from(new Set([...(Array.isArray(p.images) ? p.images : []), ...urls])).filter(Boolean),
      }));
      setSelectedFiles([]);
    } catch (err) {
      setUploadError(err?.response?.data?.message || err?.message || 'Failed to upload images');
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        logout();
      }
    } finally {
      setUploading(false);
    }
  };

  const onClearAllProducts = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.delete('/api/products/admin', {
        headers: authHeaders(token),
      });
      setSuccess('All products deleted. Homepage will be empty until you add new products.');
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete products');
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!Array.isArray(form.images) || form.images.length === 0) {
        setError('Please upload at least one product image.');
        return;
      }

      const payload = {
        title: form.title,
        category: form.category,
        price: Number(form.price),
        mrp: Number(form.mrp),
        discountPercent: Number(form.discountPercent),
        rating: Number(form.rating),
        ratingCount: Number(form.ratingCount),
        images: form.images,
        highlights: parseLines(form.highlights),
        offers: parseLines(form.offers),
        specs: parseSpecs(form.specs),
      };

      await api.post('/api/products', payload, {
        headers: authHeaders(token),
      });

      setSuccess('Product created successfully. It will appear on the homepage.');
      setForm((p) => ({ ...p, title: '', images: [] }));
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create product');
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Admin • Add Product" subtitle="Creates product in database (admin protected)">
      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}
      {success ? (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>
      ) : null}

      {importError ? (
        <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{importError}</div>
      ) : null}
      {importSuccess ? (
        <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {importSuccess}
        </div>
      ) : null}

      <div className="mt-4 rounded-md border border-slate-200 bg-white p-4">
        <div className="text-sm font-bold text-slate-900">Bulk Import (JSON)</div>
        <div className="mt-2 text-xs text-slate-600">
          Upload a JSON file (array of products). For images, either put existing "/uploads/..." URLs in JSON OR provide image files here and
          reference them by filename inside JSON (example: "iphone1.webp").
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div>
            <label className="text-xs font-bold text-slate-600">Products JSON file</label>
            <input
              type="file"
              accept="application/json,.json"
              onChange={(e) => setImportJsonFile((e.target.files && e.target.files[0]) || null)}
              className="mt-1 block w-full text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600">Images (optional)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImportImageFiles(Array.from(e.target.files || []))}
              className="mt-1 block w-full text-sm"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onImportBulk}
          disabled={importing || loading || uploading}
          className="mt-4 h-11 w-full rounded-sm bg-[#fb641b] px-4 text-sm font-bold text-white hover:bg-[#ff6f2d] disabled:opacity-50"
        >
          {importing ? 'Importing…' : 'Import Products'}
        </button>
      </div>

      <div className={(error || success) ? 'mt-4 grid gap-4 lg:grid-cols-[1fr_360px]' : 'grid gap-4 lg:grid-cols-[1fr_360px]'}>
        <form onSubmit={onSubmit} className="grid gap-3">
          <button
            type="button"
            onClick={onClearAllProducts}
            disabled={loading || uploading}
            className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            Clear All Products
          </button>

                <div>
                  <label className="text-xs font-bold text-slate-600">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setField('title', e.target.value)}
                    required
                    className="mt-1 h-11 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2874f0]"
                    placeholder="Product title"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-600">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setField('category', e.target.value)}
                      className="mt-1 h-11 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2874f0]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600">Discount %</label>
                    <input
                      value={form.discountPercent}
                      onChange={(e) => setField('discountPercent', e.target.value)}
                      className="mt-1 h-11 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2874f0]"
                      type="number"
                      min="0"
                      max="90"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-600">Price</label>
                    <input
                      value={form.price}
                      onChange={(e) => setField('price', e.target.value)}
                      required
                      className="mt-1 h-11 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2874f0]"
                      type="number"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600">MRP</label>
                    <input
                      value={form.mrp}
                      onChange={(e) => setField('mrp', e.target.value)}
                      required
                      className="mt-1 h-11 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2874f0]"
                      type="number"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-600">Rating</label>
                    <input
                      value={form.rating}
                      onChange={(e) => setField('rating', e.target.value)}
                      className="mt-1 h-11 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2874f0]"
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600">Rating Count</label>
                    <input
                      value={form.ratingCount}
                      onChange={(e) => setField('ratingCount', e.target.value)}
                      className="mt-1 h-11 w-full rounded-sm border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#2874f0]"
                      type="number"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">Images</label>

                  <div className="mt-1 grid gap-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                      className="block w-full text-sm"
                    />

                    <button
                      type="button"
                      onClick={onUploadFiles}
                      disabled={!selectedFiles.length || uploading || loading}
                      className="h-11 rounded-sm border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {uploading ? 'Uploading…' : 'Upload Selected Images'}
                    </button>

                    {uploadError ? (
                      <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{uploadError}</div>
                    ) : null}
                  </div>

                  {Array.isArray(form.images) && form.images.length ? (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {form.images.map((src) => (
                        <div key={src} className="aspect-square overflow-hidden rounded bg-slate-50">
                          <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 rounded bg-slate-50 p-3 text-xs text-slate-600">
                      No images uploaded yet.
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">Highlights (one per line)</label>
                  <textarea
                    value={form.highlights}
                    onChange={(e) => setField('highlights', e.target.value)}
                    className="mt-1 min-h-20 w-full resize-none rounded-sm border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#2874f0]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">Offers (one per line)</label>
                  <textarea
                    value={form.offers}
                    onChange={(e) => setField('offers', e.target.value)}
                    className="mt-1 min-h-20 w-full resize-none rounded-sm border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#2874f0]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600">Specs (Key: Value per line)</label>
                  <textarea
                    value={form.specs}
                    onChange={(e) => setField('specs', e.target.value)}
                    className="mt-1 min-h-24 w-full resize-none rounded-sm border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#2874f0]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full rounded-sm bg-[#2874f0] px-4 py-3 text-sm font-bold text-white hover:bg-[#1e60d6] disabled:opacity-50"
                >
                  {loading ? 'Creating…' : 'Create Product'}
                </button>
        </form>

        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-sm font-bold text-slate-900">Preview</div>
          <div className="mt-3 rounded-md bg-slate-50 p-3">
            <div className="aspect-square w-full overflow-hidden rounded bg-white">
              <img
                src={preview.images[0] || placeholderImg}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900">{preview.title}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-base font-extrabold text-slate-900">{formatINR(preview.price)}</div>
              <div className="text-xs text-slate-500 line-through">{formatINR(preview.mrp)}</div>
            </div>
            <div className="mt-2 text-xs font-bold text-emerald-700">{preview.discountPercent}% off</div>
          </div>

          <div className="mt-3 rounded bg-slate-50 p-3 text-xs text-slate-600">
            Tip: production ke liye images aap apne CDN/S3 se serve karna.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
