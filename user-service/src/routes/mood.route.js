import { Router } from "express";
import {
  createMoodEntry,
  getMoodEntries,
  getMoodAnalytics,
  getUserAchievements,
  triggerSOS,
} from "../controllers/mood.controller.js";
import {
  getRecommendedListeners,
  getListenerStats,
} from "../controllers/recommendation.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Mood tracking
router.post("/entries", createMoodEntry);
router.get("/entries", getMoodEntries);
router.get("/analytics", getMoodAnalytics);

// Achievements
router.get("/achievements", getUserAchievements);

// Emergency SOS
router.post("/sos", triggerSOS);

// AI Recommendations
router.get("/recommendations", getRecommendedListeners);
router.get("/listener-stats/:listenerId", getListenerStats);

export default router;
