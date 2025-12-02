import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { connectDB } from "./config/mongodb.js";
import aiRoutes from "./routes/ai.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Connect to MongoDB
connectDB();

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:8080",
    "http://localhost:8081",
    "http://localhost:3000",
    "https://moodlift.vercel.app",
    "https://moodlift.netlify.app",
    "https://mood-lift-support.vercel.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());
app.use(cors(corsOptions));

// Request logging
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// Request ID middleware
app.use((req, res, next) => {
  req.id = Math.random().toString(36).substring(7);
  res.setHeader("X-Request-ID", req.id);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Stricter rate limit for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "production" ? 20 : 100,
  message: "Too many AI requests, please slow down.",
});
app.use("/api/v1/ai/chat", aiLimiter);
app.use("/api/v1/ai/chat/stream", aiLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check with detailed status
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "ai-service",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    environment: process.env.NODE_ENV || "development",
  });
});

// Readiness check
app.get("/ready", (req, res) => {
  // Check if MongoDB is connected
  const mongoose = require("mongoose");
  if (mongoose.connection.readyState === 1) {
    res.json({ status: "ready" });
  } else {
    res
      .status(503)
      .json({ status: "not ready", reason: "database not connected" });
  }
});

// Routes
app.use("/api/interactions", aiRoutes);
app.use("/api/v1/ai", aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${req.id}] Error:`, err.stack);

  // Don't leak error details in production
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  res.status(err.status || 500).json({
    success: false,
    message,
    requestId: req.id,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`AI service running on port ${PORT}`);
});
