import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import connectDB from "./utils/db.js";
import { notFound, errorHandler } from "./middleware/error.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";
import uploadsRoutes from "./routes/uploads.js";
import Product from "./models/product.js";



// Load env vars
dotenv.config();

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function seedProductsIfEmpty() {
  const shouldSeed = String(process.env.SEED_PRODUCTS_ON_START || "false").toLowerCase() === "true";
  if (!shouldSeed) return;

  const count = await Product.countDocuments({});
  if (count > 0) return;

  const seedPath = path.join(__dirname, "..", "products-50.json");
  const raw = await fs.readFile(seedPath, "utf-8");
  const parsed = JSON.parse(raw);
  const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.products) ? parsed.products : [];
  if (!Array.isArray(list) || list.length === 0) return;

  const used = new Set();
  const docs = list
    .filter((p) => p && typeof p === "object")
    .map((p) => {
      const base = slugify(p.slug || p.title);
      let slug = base || `product-${Math.random().toString(36).slice(2, 8)}`;
      let i = 2;
      while (used.has(slug)) {
        slug = `${base}-${i}`;
        i += 1;
      }
      used.add(slug);

      return {
        title: p.title,
        slug,
        category: p.category,
        price: p.price,
        mrp: p.mrp,
        discountPercent: p.discountPercent,
        rating: p.rating,
        ratingCount: p.ratingCount,
        images: Array.isArray(p.images) ? p.images : [],
        highlights: Array.isArray(p.highlights) ? p.highlights : [],
        specs: p.specs && typeof p.specs === "object" ? p.specs : {},
        offers: Array.isArray(p.offers) ? p.offers : [],
      };
    });

  await Product.insertMany(docs);
}

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Body parser
app.use(express.json({ limit: "15mb" }));

// CORS
app.use(cors());

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/uploads", uploadsRoutes);


// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  await seedProductsIfEmpty();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
