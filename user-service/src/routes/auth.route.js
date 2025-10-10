import { Router } from "express";
import {
  register,
  login,
  verifyToken,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/verify-token", verifyToken);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

export default router;
