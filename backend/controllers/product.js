import Product from "../models/product.js";
import asyncHandler from "express-async-handler";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function makeUniqueSlug(base) {
  const root = slugify(base) || "product";
  let slug = root;
  let i = 2;
  while (await Product.exists({ slug })) {
    slug = `${root}-${i}`;
    i += 1;
  }
  return slug;
}

async function makeUniqueSku(seed) {
  const root = slugify(seed) || "sku";
  let sku = `${root}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  while (await Product.exists({ sku })) {
    sku = `${root}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }
  return sku;
}

export const listProducts = asyncHandler(async (req, res) => {
  const items = await Product.find({}).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: items });
});

export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await Product.findById(id);
  if (!item) return res.status(404).json({ success: false, message: "Product not found" });
  res.status(200).json({ success: true, data: item });
});

export const createProduct = asyncHandler(async (req, res) => {
  const payload = req.body || {};

  const desiredSlug = payload.slug ? slugify(payload.slug) : "";
  const slug = desiredSlug ? await makeUniqueSlug(desiredSlug) : await makeUniqueSlug(payload.title);

  const sku = payload.sku ? String(payload.sku).trim() : await makeUniqueSku(slug);

  const created = await Product.create({
    title: payload.title,
    sku,
    slug,
    category: payload.category,
    price: payload.price,
    mrp: payload.mrp,
    discountPercent: payload.discountPercent,
    rating: payload.rating ?? 4.0,
    ratingCount: payload.ratingCount ?? 0,
    images: Array.isArray(payload.images) ? payload.images : [],
    highlights: Array.isArray(payload.highlights) ? payload.highlights : [],
    specs: payload.specs && typeof payload.specs === "object" ? payload.specs : {},
    offers: Array.isArray(payload.offers) ? payload.offers : [],
  });

  res.status(201).json({ success: true, data: created });
});

export const deleteAllProductsAdmin = asyncHandler(async (req, res) => {
  await Product.deleteMany({});
  return res.status(200).json({ success: true });
});
