import express from "express";
import proxy from "express-http-proxy";
import jwt from "jsonwebtoken";

const app = express();

// Middleware: Verify JWT
app.use((req, res, next) => {
  if (req.path.startsWith("/auth")) return next(); // auth routes are public

  const token = req.headers["authorization"];
  if (!token) return res.status(401).send("No token provided");

  try {
    const decoded = jwt.verify(token.split(" ")[1], "SECRET_KEY");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).send("Invalid token");
  }
});

// Routes
app.use("/health", (req, res) => res.send("OK"));
app.use("/auth", proxy("http://localhost:3001"));
app.use("/sessions", proxy("http://localhost:3002"));
app.use("/social", proxy("http://localhost:3003"));
app.use("/analytics", proxy("http://localhost:3004"));
app.use("/notifications", proxy("http://localhost:3005"));
app.listen(3000, () => console.log("🚀 API Gateway running on 4000"));
