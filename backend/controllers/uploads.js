import asyncHandler from "express-async-handler";

export const uploadImages = asyncHandler(async (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];
  const items = files.map((f) => ({ originalName: f.originalname, url: `/uploads/${f.filename}` }));
  const urls = items.map((i) => i.url);
  return res.status(201).json({ success: true, data: { urls, items } });
});
