import express from "express";
import { createOrder, deleteAllOrdersAdmin, getOrderByOrderId, listOrdersAdmin, trackOrdersByMobile } from "../controllers/order.js";
import { adminProtect } from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/track", trackOrdersByMobile);
router.get("/admin", adminProtect, listOrdersAdmin);
router.delete("/admin", adminProtect, deleteAllOrdersAdmin);
router.get("/:orderId", getOrderByOrderId);

export default router;
