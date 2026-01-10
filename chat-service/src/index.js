import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { connectDB } from "./config/mongodb.js";
import chatRoutes from "./routes/chat.route.js";
import communityRoutes from "./routes/community.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Connect to MongoDB
connectDB();

// CORS Configuration - Temporary: Allow all origins for debugging
const corsOptions = {
  origin: "*",
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
    service: "chat-service",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/messages", chatRoutes); // Legacy route
app.use("/api/v1/chat", chatRoutes); // New advanced chat routes
app.use("/api/v1/community", communityRoutes); // Community posts & feed

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
  console.log(`Chat service running on port ${PORT}`);
});
