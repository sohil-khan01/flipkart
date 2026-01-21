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

  const created = await Product.create({
    title: payload.title,
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

export const createProductsBulk = asyncHandler(async (req, res) => {
  const body = req.body;
  const list = Array.isArray(body) ? body : Array.isArray(body?.products) ? body.products : null;
  if (!Array.isArray(list) || list.length === 0) {
    return res.status(400).json({ success: false, message: "Expected a non-empty array of products" });
  }

  const createdItems = [];

  for (const raw of list) {
    const payload = raw && typeof raw === "object" ? raw : {};

    if (!payload.title || !payload.category) {
      return res.status(400).json({ success: false, message: "Each product requires title and category" });
    }

    const desiredSlug = payload.slug ? slugify(payload.slug) : "";
    const slug = desiredSlug ? await makeUniqueSlug(desiredSlug) : await makeUniqueSlug(payload.title);

    const created = await Product.create({
      title: payload.title,
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

    createdItems.push(created);
  }

  return res.status(201).json({ success: true, data: { count: createdItems.length, items: createdItems } });
});

export const deleteAllProductsAdmin = asyncHandler(async (req, res) => {
  await Product.deleteMany({});
  return res.status(200).json({ success: true });
});
