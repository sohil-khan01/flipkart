import express from "express";

const router = express.Router();

router.use((req, res) => {
  return res.status(410).json({ success: false, message: "User APIs are disabled" });
});

export default router;
