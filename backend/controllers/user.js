import User from "../models/user.js";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// @desc   Register user
// @route  POST /api/users/register
// @access Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Please provide all required fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register Error Details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      errors: error.errors
    });
    res.status(500).json({ 
      success: false, 
      message: error.message || "Registration failed",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
};

// @desc   Login user
// @route  POST /api/users/login
// @access Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get current logged in user
// @route  GET /api/users/me
// @access Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
