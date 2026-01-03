import express from "express";
import proxy from "express-http-proxy";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const serviceHosts = {
  user: process.env.USER_SERVICE_URL || "http://user-service:3001",
  session: process.env.SESSION_SERVICE_URL || "http://session-service:3002",
  chat: process.env.CHAT_SERVICE_URL || "http://chat-service:3003",
  payment: process.env.PAYMENT_SERVICE_URL || "http://payment-service:3004",
  ai: process.env.AI_SERVICE_URL || "http://ai-service:3005",
  feedback: process.env.FEEDBACK_SERVICE_URL || "http://feedback-service:3006",
};

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:3000",
  "https://mood-lift-support.vercel.app",
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
    : []),
].filter(Boolean);

// Request logging middleware (first)
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Basic middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    console.log(`✅ CORS preflight for ${req.url}`);
    return res.sendStatus(200);
  }

  next();
});

// Middleware: Skip JWT verification for public routes
app.use((req, res, next) => {
  const publicRoutes = ["/auth/", "/health", "/listeners/approved"];

  console.log(`🔍 Checking auth for: ${req.method} ${req.path}`);

  const isPublicRoute = publicRoutes.some((route) =>
    req.path.startsWith(route)
  );

  if (isPublicRoute) {
    console.log(`👌 Public route - skipping auth`);
    return next();
  }

  const token = req.headers["authorization"];
  if (!token) {
    console.log(`❌ No token provided for protected route`);
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], "SECRET_KEY");
    req.user = decoded;
    console.log(`✅ Token verified for user:`, decoded.userId);
    next();
  } catch (err) {
    console.log(`❌ Invalid token:`, err.message);
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
});

// Routes
app.use("/health", (req, res) =>
  res.json({ status: "OK", timestamp: new Date().toISOString() })
);

// Test route to verify middleware chain
app.get("/test", (req, res) => {
  console.log(`🧪 Test route hit`);
  res.json({
    message: "Gateway test successful",
    path: req.path,
    url: req.url,
  });
});

// User service routes
app.use(
  "/auth",
  proxy(serviceHosts.user, {
    proxyReqPathResolver: (req) => `/api/v1/auth${req.url}`,
  })
);
app.use(
  "/users",
  proxy(serviceHosts.user, {
    proxyReqPathResolver: (req) => `/api/v1/users${req.url}`,
  })
);
app.use(
  "/listeners",
  proxy(serviceHosts.user, {
    proxyReqPathResolver: (req) => `/api/v1/listeners${req.url}`,
  })
);

// Other service routes
app.use(
  "/sessions",
  proxy(serviceHosts.session, {
    proxyReqPathResolver: (req) => `/api/sessions${req.url}`,
  })
);
app.use("/chat", proxy(serviceHosts.chat));
app.use("/payment", proxy(serviceHosts.payment));
app.use("/ai", proxy(serviceHosts.ai));
app.use("/feedback", proxy(serviceHosts.feedback));

app.listen(PORT, () => console.log(`🚀 API Gateway running on ${PORT}`));
