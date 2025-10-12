import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { userRepo } from "../models/user.model.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";

// Helper function to generate JWT token
const generateToken = (userId, email, role) => {
  return jwt.sign({ userId, email, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
};

// Helper function to generate random token
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role, bio, expertise, hourlyRate } =
      req.body;

    // Validation
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing required   fields: fullName, email, password, role",
      });
    }

    if (!["user", "listener"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be 'user' or 'listener'",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // For listeners, validate required fields
    if (role === "listener") {
      if (!bio || !expertise || !hourlyRate) {
        return res.status(400).json({
          success: false,
          message: "Listeners must provide bio, expertise, and hourlyRate",
        });
      }

      const rate = parseFloat(hourlyRate);
      if (rate < 10 || rate > 200) {
        return res.status(400).json({
          success: false,
          message: "Hourly rate must be between $10 and $200",
        });
      }
    }

    // Check if user already exists
    const existingUser = await userRepo.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Prepare user data
    const userData = {
      userId: uuidv4(),
      name: fullName,
      email,
      passwordHash,
      role,
      // Users are treated as verified by default; listeners require email verification
      isEmailVerified: role === "user" ? true : false,
      freeSessionsUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add listener-specific fields if role is listener
    if (role === "listener") {
      userData.bio = bio;
      userData.expertise = Array.isArray(expertise)
        ? expertise
        : expertise.split(",").map((e) => e.trim());
      userData.hourlyRate = parseFloat(hourlyRate);
      userData.isApproved = false; // Listeners need approval
    }

    // If role is listener, generate email verification token and add listener-specific fields
    let emailVerificationToken;
    if (role === "listener") {
      emailVerificationToken = generateRandomToken();
      const emailVerificationExpires = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ); // 24 hours
      userData.emailVerificationToken = emailVerificationToken;
      userData.emailVerificationExpires = emailVerificationExpires;

      // Add listener-specific fields
      userData.bio = bio;
      userData.expertise = Array.isArray(expertise)
        ? expertise
        : expertise.split(",").map((e) => e.trim());
      userData.hourlyRate = parseFloat(hourlyRate);
      userData.isApproved = false; // Listeners need approval
    }

    // Create user
    const createdUser = await userRepo.createUser(userData);

    // Generate JWT token
    const token = generateToken(
      createdUser.userId,
      createdUser.email,
      createdUser.role
    );

    // Remove sensitive data from response
    const {
      passwordHash: _,
      emailVerificationToken: __,
      ...safeUser
    } = createdUser;

    res.status(201).json({
      success: true,
      message:
        role === "listener"
          ? "Listener application submitted successfully. Please check your email for verification."
          : "User registered successfully.",
      user: safeUser,
      token,
    });

    // If listener, log/send verification token (email service integration pending)
    if (role === "listener") {
      console.log(`Verification token for ${email}: ${emailVerificationToken}`);
    }
  } catch (error) {
    console.error("Registration error:", error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await userRepo.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    // For listeners, check if approved
    if (user.role === "listener" && !user.isApproved) {
      return res.status(401).json({
        success: false,
        message: "Your listener application is still under review",
      });
    }

    // Generate JWT token
    const token = generateToken(user.userId, user.email, user.role);

    // Remove sensitive data from response
    const {
      passwordHash: _,
      emailVerificationToken: __,
      passwordResetToken: ___,
      ...safeUser
    } = user;

    res.json({
      success: true,
      message: "Login successful",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    const user = await userRepo.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Remove sensitive data
    const {
      passwordHash: _,
      emailVerificationToken: __,
      passwordResetToken: ___,
      ...safeUser
    } = user;

    res.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
    console.error("Token verification error:", error);
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    // Find user with this verification token
    const user = await userRepo.getUserByEmailVerificationToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Check if token is expired
    if (user.emailVerificationExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Verification token has expired",
      });
    }

    // Update user as verified
    await userRepo.updateUser(user.userId, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    next(error);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userRepo.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message:
          "If an account with this email exists, a password reset link has been sent",
      });
    }

    // Generate reset token
    const passwordResetToken = generateRandomToken();
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await userRepo.updateUser(user.userId, {
      passwordResetToken,
      passwordResetExpires,
      updatedAt: new Date(),
    });

    // TODO: Send password reset email
    console.log(`Password reset token for ${email}: ${passwordResetToken}`);

    res.json({
      success: true,
      message:
        "If an account with this email exists, a password reset link has been sent",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Find user with this reset token
    const user = await userRepo.getUserByPasswordResetToken(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Check if token is expired
    if (user.passwordResetExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Reset token has expired",
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    await userRepo.updateUser(user.userId, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    next(error);
  }
};
