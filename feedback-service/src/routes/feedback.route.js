import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { feedbackRepo } from "../models/feedback.model.js";

const router = Router();

// Create a new feedback
router.post("/", async (req, res, next) => {
  try {
    const { userId, sessionId, rating, comments } = req.body;

    if (!userId || !sessionId || rating === undefined || !comments) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const feedback = {
      feedbackId: uuidv4(),
      userId,
      sessionId,
      rating,
      comments,
      createdAt: new Date().toISOString(),
    };

    const createdFeedback = await feedbackRepo.createFeedback(feedback);
    res.status(201).json(createdFeedback);
  } catch (error) {
    next(error);
  }
});

// Get feedback by ID
router.get("/:feedbackId", async (req, res, next) => {
  try {
    const { feedbackId } = req.params;
    const feedback = await feedbackRepo.getFeedbackById(feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json(feedback);
  } catch (error) {
    next(error);
  }
});

// Get all feedback for a user
router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const feedback = await feedbackRepo.getFeedbackByUserId(userId);
    res.json(feedback);
  } catch (error) {
    next(error);
  }
});

// Get all feedback for a session
router.get("/session/:sessionId", async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const feedback = await feedbackRepo.getFeedbackBySessionId(sessionId);
    res.json(feedback);
  } catch (error) {
    next(error);
  }
});

// Get feedback by rating
router.get("/rating/:rating", async (req, res, next) => {
  try {
    const { rating } = req.params;
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be a number between 1 and 5" });
    }
    const feedback = await feedbackRepo.getFeedbackByRating(ratingNum);
    res.json(feedback);
  } catch (error) {
    next(error);
  }
});

// Get average rating
router.get("/stats/average", async (req, res, next) => {
  try {
    const averageRating = await feedbackRepo.getAverageRating();
    res.json({ averageRating });
  } catch (error) {
    next(error);
  }
});

// Get all feedback
router.get("/", async (req, res, next) => {
  try {
    const feedback = await feedbackRepo.getAllFeedback();
    res.json(feedback);
  } catch (error) {
    next(error);
  }
});

// Update feedback
router.put("/:feedbackId", async (req, res, next) => {
  try {
    const { feedbackId } = req.params;
    const updates = req.body;

    if (
      updates.rating !== undefined &&
      (updates.rating < 1 || updates.rating > 5)
    ) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const updatedFeedback = await feedbackRepo.updateFeedback(
      feedbackId,
      updates
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json(updatedFeedback);
  } catch (error) {
    next(error);
  }
});

// Delete feedback
router.delete("/:feedbackId", async (req, res, next) => {
  try {
    const { feedbackId } = req.params;
    await feedbackRepo.deleteFeedback(feedbackId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
