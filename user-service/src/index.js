import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import mongoose from "mongoose";

import userRoute from "./routes/user.route.js";
import authRoute from "./routes/auth.route.js";
import listenerRoute from "./routes/listener.route.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env["USER_SERVICE_PORT"] || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Middleware
app.use(limiter);
app.use(helmet());
app.use(
  cors({
    origin:
      process.env["NODE_ENV"] === "production"
        ? ["https://your-frontend-domain.com"]
        : ["http://localhost:3000", "http://localhost:8080"],
    credentials: true,
  })
);
app.use(compression());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env["NODE_ENV"],
  });
});

// API routes
app.use("/api/v1/users", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/listeners", listenerRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // MongoDB validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Start server
const MONGODB_URI =
  process.env["MONGODB_URI"] || "mongodb://127.0.0.1:27017/moodlift";

mongoose
  .connect(MONGODB_URI, {
    dbName: process.env["MONGODB_DB"] || "moodlift",
    retryWrites: true,
    w: "majority",
  })
  .then(() => {
    console.log("✅ Connecte dddfd to MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`🚀 User Service running on port ${PORT}`);
      console.log(
        `📊 Environment: ${process.env["NODE_ENV"] || "development"}`
      );
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

export default app;
