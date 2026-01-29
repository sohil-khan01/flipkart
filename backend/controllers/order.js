import Order from "../models/order.js";
import asyncHandler from "express-async-handler";

function makeOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ts}-${rnd}`;
}

function computeDeliveryDate(seed) {
  const s = String(seed || "");
  let sum = 0;
  for (let i = 0; i < s.length; i += 1) sum = (sum + s.charCodeAt(i)) % 1000;
  const days = 3 + (sum % 2);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function normalizeMobile(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(-10);
}

export const createOrder = asyncHandler(async (req, res) => {
  const body = req.body || {};

  if (!body.customer?.name || !body.customer?.mobile || !body.customer?.address) {
    return res.status(400).json({ success: false, message: "Customer details are required" });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return res.status(400).json({ success: false, message: "Order items are required" });
  }

  const payment = "upi";
  const paymentRef = String(body.paymentRef || "").trim();
  const status = "pending";

  const orderId = makeOrderId();
  const deliveryDate = computeDeliveryDate(orderId);

  const subtotal = Number(body.subtotal || 0);
  const delivery = Number(body.delivery || 0);
  const total = Number(body.total || subtotal + delivery);

  const created = await Order.create({
    orderId,
    deliveryDate,
    customer: {
      name: body.customer.name,
      mobile: normalizeMobile(body.customer.mobile),
      address: String(body.customer.address || "").trim(),
    },
    payment,
    paymentRef,
    status,
    items: body.items.map((it) => ({
      productId: String(it.productId),
      title: String(it.title),
      image: it.image ? String(it.image) : "",
      price: Number(it.price),
      qty: Number(it.qty),
    })),
    subtotal,
    delivery,
    total,
  });

  return res.status(201).json({ success: true, data: created });
});

export const getOrderByOrderId = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findOne({ orderId: String(orderId) });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  return res.status(200).json({ success: true, data: order });
});

export const trackOrdersByMobile = asyncHandler(async (req, res) => {
  const raw = String(req.query.mobile || "");
  const mobile = normalizeMobile(raw);

  if (mobile.length !== 10) {
    return res.status(400).json({ success: false, message: "Valid 10-digit mobile number is required" });
  }

  const orders = await Order.find({ "customer.mobile": mobile }).sort({ createdAt: -1 });

  const sanitized = orders.map((o) => ({
    orderId: o.orderId,
    createdAt: o.createdAt,
    deliveryDate: o.deliveryDate,
    status: o.status,
    items: Array.isArray(o.items)
      ? o.items.map((it) => ({
          productId: it.productId,
          title: it.title,
          image: it.image,
          price: it.price,
          qty: it.qty,
        }))
      : [],
    total: o.total,
  }));

  return res.status(200).json({ success: true, data: sanitized });
});

export const listOrdersAdmin = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });
  return res.status(200).json({ success: true, data: orders });
});

export const confirmOrderAdmin = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findOne({ orderId: String(orderId) });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.status = "confirmed";
  await order.save();
  return res.status(200).json({ success: true, data: order });
});

export const rejectOrderAdmin = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findOne({ orderId: String(orderId) });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.status = "rejected";
  await order.save();
  return res.status(200).json({ success: true, data: order });
});

export const deleteAllOrdersAdmin = asyncHandler(async (req, res) => {
  await Order.deleteMany({});
  return res.status(200).json({ success: true });
});
