import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { connectDB } from "./config/mongodb.js";
import feedbackRoutes from "./routes/feedback.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

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
    process.env.FRONTEND_URL,
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.use(morgan("combined"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "feedback-service",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/feedback", feedbackRoutes); // Legacy route
app.use("/api/v1/feedback", feedbackRoutes); // New versioned route

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
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
  console.log(`Feedback service running on port ${PORT}`);
});
