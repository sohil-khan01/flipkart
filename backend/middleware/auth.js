import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/user.js";

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
      const decoded = jwt.verify(token, secret);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as admin");
  }
};
