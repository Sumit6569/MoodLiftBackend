import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { feedbackRepo } from "../models/feedback.model.js";

const router = Router();

// Create a new feedback
router.post("/", async (req, res, next) => {
  try {
    const {
      userId,
      sessionId,
      listenerId,
      rating,
      comment,
      comments,
      category,
      improvements,
    } = req.body;

    // Support both 'comment' and 'comments' field names
    const feedbackComment = comment || comments;

    if (!userId || rating === undefined || !feedbackComment) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, rating, and comment",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const feedback = {
      feedbackId: uuidv4(),
      userId,
      sessionId: sessionId || null,
      listenerId: listenerId || null,
      rating,
      comments: feedbackComment,
      category: category || "session",
      improvements: improvements || [],
      createdAt: new Date().toISOString(),
    };

    const createdFeedback = await feedbackRepo.createFeedback(feedback);
    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: createdFeedback,
    });
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
    res.json({
      success: true,
      feedback,
      count: feedback.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get all feedback for a listener
router.get("/listener/:listenerId", async (req, res, next) => {
  try {
    const { listenerId } = req.params;
    // For now, filter by listenerId from all feedback
    const allFeedback = await feedbackRepo.getAllFeedback();
    const listenerFeedback = allFeedback.filter(
      (f) => f.listenerId === listenerId
    );
    res.json({
      success: true,
      feedback: listenerFeedback,
      count: listenerFeedback.length,
    });
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

// Get feedback statistics
router.get("/stats", async (req, res, next) => {
  try {
    const allFeedback = await feedbackRepo.getAllFeedback();
    const averageRating = await feedbackRepo.getAverageRating();

    const stats = {
      totalFeedback: allFeedback.length,
      averageRating,
      ratingDistribution: {
        1: allFeedback.filter((f) => f.rating === 1).length,
        2: allFeedback.filter((f) => f.rating === 2).length,
        3: allFeedback.filter((f) => f.rating === 3).length,
        4: allFeedback.filter((f) => f.rating === 4).length,
        5: allFeedback.filter((f) => f.rating === 5).length,
      },
      categoryDistribution: allFeedback.reduce((acc, f) => {
        const cat = f.category || "session";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {}),
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
});

// Get all feedback
router.get("/", async (req, res, next) => {
  try {
    const feedback = await feedbackRepo.getAllFeedback();
    res.json({
      success: true,
      feedback,
      count: feedback.length,
    });
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
