import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import mongoose from "mongoose";

import userRoute from "./routes/user.route.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";

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
        : ["http://localhost:3000"],
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

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const MONGODB_URI =
  process.env["MONGODB_URI"] || "mongodb://127.0.0.1:27017/moodlift";

mongoose
  .connect(MONGODB_URI, { dbName: process.env["MONGODB_DB"] || undefined })
  .then(() => {
    console.log("✅ Connected to MongoDB");
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
