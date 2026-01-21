import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { uploadImages } from "../controllers/uploads.js";
import { adminProtect } from "../middleware/adminAuth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.resolve(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext && ext.length <= 10 ? ext : "";
    const rand = Math.random().toString(16).slice(2);
    cb(null, `${Date.now()}-${rand}${safeExt}`);
  },
});

function fileFilter(req, file, cb) {
  const ok = typeof file.mimetype === "string" && file.mimetype.startsWith("image/");
  cb(ok ? null : new Error("Only image uploads are allowed"), ok);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router();

router.post("/images", adminProtect, upload.array("images", 8), uploadImages);

export default router;
