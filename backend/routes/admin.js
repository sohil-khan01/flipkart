import express from "express";
import { adminLogin, adminMe } from "../controllers/admin.js";
import { adminProtect } from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/me", adminProtect, adminMe);

export default router;
