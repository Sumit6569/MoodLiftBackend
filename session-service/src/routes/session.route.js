import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { sessionRepo } from "../models/session.model.js";
import {
  sendSessionRequestEmail,
  sendSessionConfirmedEmail,
} from "../utils/emailService.js";

const router = Router();

// Helper function to fetch user details
const fetchUserDetails = async (userId) => {
  try {
    const userServiceUrl =
      process.env.USER_SERVICE_URL || "https://moodliftbackend.onrender.com";
    const response = await fetch(`${userServiceUrl}/api/v1/users/${userId}`);
    if (!response.ok) {
      console.error(`Failed to fetch user ${userId}`);
      return null;
    }
    const data = await response.json();
    return data.user || data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
};

// Helper function to fetch listener details
const fetchListenerDetails = async (listenerId) => {
  try {
    const userServiceUrl =
      process.env.USER_SERVICE_URL || "https://moodliftbackend.onrender.com";
    const response = await fetch(
      `${userServiceUrl}/api/v1/listeners/${listenerId}`
    );
    if (!response.ok) {
      console.error(`Failed to fetch listener ${listenerId}`);
      return null;
    }
    const data = await response.json();
    return data.listener || data;
  } catch (error) {
    console.error(`Error fetching listener ${listenerId}:`, error);
    return null;
  }
};

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

    // Send email notification to listener (non-blocking)
    (async () => {
      try {
        const [user, listener] = await Promise.all([
          fetchUserDetails(userId),
          fetchListenerDetails(listenerId),
        ]);

        if (user && listener) {
          await sendSessionRequestEmail(
            listener.email,
            listener.name,
            user.name,
            {
              sessionId: createdSession.sessionId,
              type: createdSession.type,
              cost: createdSession.cost,
              startTime: createdSession.startTime,
            }
          );
          console.log(
            `Session request email sent to listener: ${listener.email}`
          );
        }
      } catch (emailError) {
        console.error("Error sending session request email:", emailError);
        // Don't fail the request if email fails
      }
    })();

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
      ![
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        "rejected",
      ].includes(updates.status)
    ) {
      return res.status(400).json({
        message:
          'Status must be "pending", "confirmed", "active", "completed", "cancelled", or "rejected"',
      });
    }

    // Update the updatedAt timestamp
    updates.updatedAt = new Date().toISOString();

    // If status is being changed to confirmed, add confirmedAt timestamp
    if (updates.status === "confirmed") {
      updates.confirmedAt = new Date().toISOString();
    }

    // If status is being changed to completed, add completedAt timestamp
    if (updates.status === "completed") {
      updates.completedAt = new Date().toISOString();
      if (!updates.endTime) {
        updates.endTime = new Date().toISOString();
      }
    }

    const updatedSession = await sessionRepo.updateSession(sessionId, updates);

    if (!updatedSession) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Send confirmation email to user when status changes to "confirmed" (non-blocking)
    if (updates.status === "confirmed") {
      (async () => {
        try {
          const [user, listener] = await Promise.all([
            fetchUserDetails(updatedSession.userId),
            fetchListenerDetails(updatedSession.listenerId),
          ]);

          if (user && listener) {
            await sendSessionConfirmedEmail(
              user.email,
              user.name,
              listener.name,
              {
                sessionId: updatedSession.sessionId,
                type: updatedSession.type,
                cost: updatedSession.cost,
                scheduledStartTime: updatedSession.scheduledStartTime,
                scheduledEndTime: updatedSession.scheduledEndTime,
                duration: updatedSession.duration,
                meetingLink: updatedSession.meetingLink,
                listenerInstructions: updatedSession.listenerInstructions,
              }
            );
            console.log(
              `Session confirmation email sent to user: ${user.email}`
            );
          }
        } catch (emailError) {
          console.error(
            "Error sending session confirmation email:",
            emailError
          );
          // Don't fail the request if email fails
        }
      })();
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
