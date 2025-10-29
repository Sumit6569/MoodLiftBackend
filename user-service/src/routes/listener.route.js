import { Router } from "express";
import {
  getApprovedListeners,
  getPendingListeners,
  approveListener,
  rejectListener,
  updateListenerProfile,
  getAllListeners,
  verifyListener,
  getListenerById,
} from "../controllers/listener.controller.js";
import {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
} from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.get("/approved", getApprovedListeners);

// Admin routes (MUST come before /:userId to avoid route conflicts)
router.get("/all", authenticateToken, requireAdmin, getAllListeners);
router.get("/pending", authenticateToken, requireAdmin, getPendingListeners);

// Get single listener by ID (MUST come after specific routes)
router.get("/:userId", getListenerById);
router.post(
  "/:userId/approve",
  authenticateToken,
  requireAdmin,
  approveListener
);
router.post("/:userId/reject", authenticateToken, requireAdmin, rejectListener);
router.post("/:userId/verify", authenticateToken, requireAdmin, verifyListener);

// Listener profile management (listener can update their own profile, admin can update any)
router.put(
  "/:userId/profile",
  authenticateToken,
  requireOwnershipOrAdmin,
  updateListenerProfile
);

export default router;
