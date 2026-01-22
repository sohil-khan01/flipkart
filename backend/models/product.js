import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, unique: true },
    slug: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
    rating: { type: Number, default: 4.0 },
    ratingCount: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    highlights: { type: [String], default: [] },
    specs: { type: Object, default: {} },
    offers: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
