import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const adminProtect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization) {
    const authHeader = String(req.headers.authorization);
    if (/^bearer\s+/i.test(authHeader)) {
      token = authHeader.split(" ")[1];
    }
  }

  if (token) {
    token = String(token).trim().replace(/^"|"$/g, "");
    if (token === "null" || token === "undefined") token = undefined;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const decoded = jwt.verify(token, secret);

    if (!decoded || decoded.type !== "admin") {
      res.status(403);
      throw new Error("Not authorized as admin");
    }

    req.admin = true;
    next();
  } catch (e) {
    res.status(401);
    if (process.env.NODE_ENV === "development") {
      throw new Error(`Not authorized, token failed: ${e.message}`);
    }
    throw new Error("Not authorized, token failed");
  }
});
