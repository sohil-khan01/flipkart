import express from "express";
import {
  confirmOrderAdmin,
  rejectOrderAdmin,
  createOrder,
  deleteAllOrdersAdmin,
  getOrderByOrderId,
  listOrdersAdmin,
  trackOrdersByMobile,
} from "../controllers/order.js";
import { adminProtect } from "../middleware/adminAuth.js";

const router = express.Router();

const orderRateState = new Map();

function rateLimitOrders(req, res, next) {
  const limit = Number(process.env.ORDER_RATE_LIMIT_PER_MIN || 60);
  const windowMs = 60 * 1000;
  const now = Date.now();

  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "").split(",")[0].trim();
  const key = ip || "unknown";

  const cur = orderRateState.get(key);
  if (!cur || now - cur.windowStart > windowMs) {
    orderRateState.set(key, { windowStart: now, count: 1 });
    return next();
  }

  if (cur.count >= limit) {
    return res.status(429).json({ success: false, message: "Too many requests. Please try again shortly." });
  }

  cur.count += 1;
  orderRateState.set(key, cur);
  return next();
}

router.post("/", rateLimitOrders, createOrder);
router.get("/track", trackOrdersByMobile);
router.get("/admin", adminProtect, listOrdersAdmin);
router.patch("/admin/:orderId/confirm", adminProtect, confirmOrderAdmin);
router.patch("/admin/:orderId/reject", adminProtect, rejectOrderAdmin);
router.delete("/admin", adminProtect, deleteAllOrdersAdmin);
router.get("/:orderId", getOrderByOrderId);

export default router;
