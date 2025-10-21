import express from "express";
import proxy from "express-http-proxy";
import jwt from "jsonwebtoken";

const app = express();

// Request logging middleware (first)
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Basic middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:8080",
    "http://localhost:3000",
    "https://mood-lift-support.vercel.app",
  ];

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

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log(`✅ CORS preflight for ${req.url}`);
    return res.sendStatus(200);
  }

  next();
});

// Middleware: Skip JWT verification for public routes
app.use((req, res, next) => {
  // Public routes that don't need authentication
  const publicRoutes = ["/auth/", "/health", "/listeners/approved"];

  console.log(`🔍 Checking auth for: ${req.method} ${req.path}`);
  console.log(`🔓 Public routes:`, publicRoutes);

  // Check if the request is for a public route
  const isPublicRoute = publicRoutes.some((route) =>
    req.path.startsWith(route)
  );

  console.log(`✨ Is public route: ${isPublicRoute}`);

  if (isPublicRoute) {
    console.log(`👌 Public route - skipping auth`);
    return next();
  }

  // For protected routes, verify JWT token
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

// User service routes (auth, users, listeners) - use localhost for local development
app.use(
  "/auth",
  proxy("http://localhost:3001", {
    proxyReqPathResolver: (req) => {
      console.log(
        `🔗 Proxying auth request: ${req.url} -> /api/v1/auth${req.url}`
      );
      return `/api/v1/auth${req.url}`;
    },
  })
);
app.use(
  "/users",
  proxy("http://localhost:3001", {
    proxyReqPathResolver: (req) => `/api/v1/users${req.url}`,
  })
);
app.use(
  "/listeners",
  proxy("http://localhost:3001", {
    proxyReqPathResolver: (req) => `/api/v1/listeners${req.url}`,
  })
);

// Other service routes - use localhost for local development
app.use(
  "/sessions",
  proxy("http://localhost:3002", {
    proxyReqPathResolver: (req) => {
      console.log(
        `🔗 Proxying session request: ${req.url} -> /api/sessions${req.url}`
      );
      return `/api/sessions${req.url}`;
    },
  })
);
app.use("/chat", proxy("http://localhost:3003"));
app.use("/payment", proxy("http://localhost:3004"));
app.use("/ai", proxy("http://localhost:3005"));
app.use("/feedback", proxy("http://localhost:3006"));
app.listen(3000, () => console.log("🚀 API Gateway running on 3000"));
