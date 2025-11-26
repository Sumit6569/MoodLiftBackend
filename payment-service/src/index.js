import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { connectDB } from "./config/mongodb.js";
import { validatePayPalConfig } from "./config/paypal.config.js";
import paymentRoutes from "./routes/payment.route.js";
import paypalRoutes from "./routes/paypal.route.js";
import subscriptionRoutes from "./routes/subscription.route.js";
import { handlePayPalWebhook } from "./controllers/webhook.controller.js";

dotenv.config();

// Validate PayPal configuration on startup
try {
  validatePayPalConfig();
  console.log("✅ PayPal configuration validated");
} catch (error) {
  console.warn("⚠️ PayPal configuration warning:", error.message);
}

const app = express();
const PORT = process.env.PORT || 3004;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
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
    service: "payment-service",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/payments", paymentRoutes); // Legacy route
app.use("/api/v1/payments", paymentRoutes); // Legacy payments

// PayPal Routes
app.use("/api/v1/paypal", paypalRoutes); // PayPal orders and transactions
app.use("/api/v1/subscriptions", subscriptionRoutes); // Subscription management

// Webhook endpoint (PayPal webhooks)
app.post(
  "/api/v1/webhooks/paypal",
  express.raw({ type: "application/json" }),
  handlePayPalWebhook
);

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
  console.log(`Payment service running on port ${PORT}`);
});
