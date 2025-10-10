import jwt from "jsonwebtoken";
import { userRepo } from "../models/user.model.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";

// Middleware to verify JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database to ensure they still exist
    const user = await userRepo.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    console.error("Token authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Middleware to check if user is a listener
export const requireListener = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.role !== "listener") {
    return res.status(403).json({
      success: false,
      message: "Listener access required",
    });
  }

  if (!req.user.isApproved) {
    return res.status(403).json({
      success: false,
      message: "Listener approval required",
    });
  }

  next();
};

// Middleware to check if user is admin (placeholder - implement based on your admin system)
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // TODO: Implement proper admin check
  // For now, we'll just check if email contains 'admin'
  if (!req.user.email.includes("admin")) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

// Middleware to check if user owns the resource or is admin
export const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const { userId } = req.params;

  // User can access their own resources or admin can access any
  if (req.user.userId === userId || req.user.email.includes("admin")) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }
};
