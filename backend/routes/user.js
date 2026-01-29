import {Router} from "express";

const router = Router();

router.use((req, res) => {
  return res.status(410).json({ success: false, message: "User APIs are disabled" });
});

export default router;
