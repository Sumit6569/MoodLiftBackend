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
router.get("/:userId", getListenerById); // Get single listener by ID

// Admin routes
router.get("/all", authenticateToken, requireAdmin, getAllListeners);
router.get("/pending", authenticateToken, requireAdmin, getPendingListeners);
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
