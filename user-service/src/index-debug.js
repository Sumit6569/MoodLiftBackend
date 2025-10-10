import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env["USER_SERVICE_PORT"] || 3001;

// Basic middleware
app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "user-service-debug",
  });
});

// Test route
app.get("/api/test", (_req, res) => {
  res.json({
    message: "User service debug version working!",
    routes: {
      health: "/api/health",
      test: "/api/test",
      auth: "/api/v1/auth/*",
      users: "/api/v1/users/*",
      listeners: "/api/v1/listeners/*",
    },
  });
});

// Add routes one by one to debug
console.log("Loading auth routes...");
try {
  const { default: authRoute } = await import("./routes/auth.route.js");
  app.use("/api/v1/auth", authRoute);
  console.log("✅ Auth routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading auth routes:", error.message);
}

console.log("Loading user routes...");
try {
  const { default: userRoute } = await import("./routes/user.route.js");
  app.use("/api/v1/users", userRoute);
  console.log("✅ User routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading user routes:", error.message);
}

console.log("Loading listener routes...");
try {
  const { default: listenerRoute } = await import("./routes/listener.route.js");
  app.use("/api/v1/listeners", listenerRoute);
  console.log("✅ Listener routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading listener routes:", error.message);
}

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
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
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 User Service (Debug) running on port ${PORT}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`🧪 Test URL: http://localhost:${PORT}/api/test`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

export default app;
