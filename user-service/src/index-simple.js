import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env["USER_SERVICE_PORT"] || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// Simple test route
app.get("/api/test", (_req, res) => {
  res.json({ message: "User service is working!" });
});

// Basic auth endpoints for testing
app.post("/api/v1/auth/register", (req, res) => {
  const { fullName, email, password, role } = req.body;

  // Basic validation
  if (!fullName || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: fullName, email, password, role",
    });
  }

  // Mock user creation (in production, this would save to database)
  const mockUser = {
    userId: `user_${Date.now()}`,
    name: fullName,
    email,
    role,
    isEmailVerified: true, // Mock as verified for testing
    isApproved: role === "user" ? true : false, // Users auto-approved, listeners need review
  };

  // Mock JWT token
  const mockToken = `mock_token_${Date.now()}`;

  res.status(201).json({
    success: true,
    message:
      role === "listener"
        ? "Listener application submitted successfully."
        : "User registered successfully.",
    user: mockUser,
    token: mockToken,
  });
});

app.post("/api/v1/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  // Mock successful login
  const mockUser = {
    userId: `user_${Date.now()}`,
    name: "Test User",
    email,
    role: "user",
    isEmailVerified: true,
  };

  const mockToken = `mock_token_${Date.now()}`;

  res.json({
    success: true,
    message: "Login successful",
    user: mockUser,
    token: mockToken,
  });
});

app.get("/api/v1/auth/verify-token", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  // Mock token validation
  if (token.startsWith("mock_token_")) {
    const mockUser = {
      userId: "user_123",
      name: "Test User",
      email: "test@example.com",
      role: "user",
    };

    return res.json({
      success: true,
      user: mockUser,
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid token",
  });
});

// Basic listeners endpoint
app.get("/api/v1/listeners/approved", (_req, res) => {
  const mockListeners = [
    {
      userId: "listener_1",
      name: "Dr. Sarah Johnson",
      email: "sarah@example.com",
      role: "listener",
      bio: "Licensed therapist with 10 years experience in anxiety and depression counseling.",
      expertise: ["Anxiety", "Depression", "Stress Management"],
      hourlyRate: 85,
      isApproved: true,
    },
    {
      userId: "listener_2",
      name: "Michael Chen",
      email: "michael@example.com",
      role: "listener",
      bio: "Certified life coach specializing in career transitions and personal growth.",
      expertise: ["Career Coaching", "Life Transitions", "Goal Setting"],
      hourlyRate: 65,
      isApproved: true,
    },
  ];

  res.json({
    success: true,
    listeners: mockListeners,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 User Service running on port ${PORT}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});
