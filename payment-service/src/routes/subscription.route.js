import { Router } from "express";
import {
  createPlan,
  createSubscription,
  activateSubscription,
  getSubscriptionDetails,
  getUserSubscriptions,
  cancelSubscription,
  getAllSubscriptions,
} from "../controllers/subscription.controller.js";

const router = Router();

// Create subscription plan
router.post("/plans", createPlan);

// Create subscription
router.post("/", createSubscription);

// Activate subscription (after user approval)
router.post("/:subscriptionId/activate", activateSubscription);

// Get subscription details
router.get("/:subscriptionId", getSubscriptionDetails);

// Get user subscriptions
router.get("/users/:userId", getUserSubscriptions);

// Cancel subscription
router.post("/:subscriptionId/cancel", cancelSubscription);

// Get all subscriptions (Admin)
router.get("/", getAllSubscriptions);

export default router;
