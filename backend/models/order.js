import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    deliveryDate: { type: Date, required: true },
    customer: {
      name: { type: String, required: true },
      mobile: { type: String, required: true },
      address: { type: String, required: true },
    },
    payment: { type: String, enum: ["upi"], required: true },
    paymentRef: { type: String, default: "" },
    status: { type: String, enum: ["pending", "confirmed", "rejected"], default: "confirmed", required: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    delivery: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

orderSchema.index({ "customer.mobile": 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
