import {Router} from "express";
import {
  createProduct,
  deleteAllProductsAdmin,
  getProduct,
  listProducts,
} from "../controllers/product.js";
import { adminProtect } from "../middleware/adminAuth.js";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", adminProtect, createProduct);
router.delete("/admin", adminProtect, deleteAllProductsAdmin);

export default router;
