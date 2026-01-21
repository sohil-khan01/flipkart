import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const adminLogin = asyncHandler(async (req, res) => {
  const { pin } = req.body;

  const expected = process.env.ADMIN_PIN;
  if (!expected) {
    return res.status(500).json({ success: false, message: "ADMIN_PIN is not configured" });
  }

  if (!pin || String(pin) !== String(expected)) {
    return res.status(401).json({ success: false, message: "Invalid admin PIN" });
  }

  const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
  const token = jwt.sign({ type: "admin" }, secret, { expiresIn: process.env.ADMIN_JWT_EXPIRE || "180d" });

  return res.status(200).json({ success: true, token });
});

export const adminMe = asyncHandler(async (req, res) => {
  return res.status(200).json({ success: true, admin: true });
});
