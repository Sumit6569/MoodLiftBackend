import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { sessionRepo } from "../models/session.model.js";

const router = Router();

// Create a new session
router.post("/", async (req, res, next) => {
  try {
    const { userId, listenerId, type, cost } = req.body;

    if (!userId || !listenerId || !type || cost === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["chat", "video"].includes(type)) {
      return res
        .status(400)
        .json({ message: 'Type must be "chat" or "video"' });
    }

    const session = {
      sessionId: uuidv4(),
      userId,
      listenerId,
      type,
      status: "pending",
      startTime: new Date().toISOString(),
      cost,
    };

    const createdSession = await sessionRepo.createSession(session);
    res.status(201).json(createdSession);
  } catch (error) {
    next(error);
  }
});

// Get session by ID
router.get("/:sessionId", async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await sessionRepo.getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
});

// Get all sessions for a user
router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const sessions = await sessionRepo.getSessionsByUserId(userId);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

// Get all sessions for a listener
router.get("/listener/:listenerId", async (req, res, next) => {
  try {
    const { listenerId } = req.params;
    const sessions = await sessionRepo.getSessionsByListenerId(listenerId);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

// Get all sessions
router.get("/", async (req, res, next) => {
  try {
    const sessions = await sessionRepo.getAllSessions();
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

// Update session
router.put("/:sessionId", async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;

    if (
      updates.status &&
      !["pending", "confirmed", "active", "completed", "cancelled"].includes(
        updates.status
      )
    ) {
      return res.status(400).json({
        message:
          'Status must be "pending", "confirmed", "active", "completed", or "cancelled"',
      });
    }

    // Update the updatedAt timestamp
    updates.updatedAt = new Date().toISOString();

    const updatedSession = await sessionRepo.updateSession(sessionId, updates);

    if (!updatedSession) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(updatedSession);
  } catch (error) {
    next(error);
  }
});

// Delete session
router.delete("/:sessionId", async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    await sessionRepo.deleteSession(sessionId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
