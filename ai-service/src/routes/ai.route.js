import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { aiInteractionRepo } from "../models/aiInteraction.model.js";
import { geminiService } from "../services/gemini.service.js";

const router = Router();

// Chat with AI
router.post("/chat", async (req, res, next) => {
  try {
    const { userId, message, conversationHistory } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, message",
      });
    }

    // Get AI response
    const aiResponse = await geminiService.chat(
      message,
      conversationHistory || []
    );

    // Save interaction
    const interaction = {
      interactionId: uuidv4(),
      userId,
      query: message,
      response: aiResponse.response,
      timestamp: new Date().toISOString(),
    };

    await aiInteractionRepo.createInteraction(interaction);

    res.json({
      success: true,
      response: aiResponse.response,
      model: aiResponse.model,
      interactionId: interaction.interactionId,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate response",
    });
  }
});

// Analyze mood
router.post("/analyze-mood", async (req, res, next) => {
  try {
    const { userId, text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    const analysis = await geminiService.analyzeMood(text);
    res.json(analysis);
  } catch (error) {
    console.error("Mood analysis error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze mood",
    });
  }
});

// Generate coping strategies
router.post("/coping-strategies", async (req, res, next) => {
  try {
    const { mood, concerns } = req.body;

    if (!mood) {
      return res.status(400).json({
        success: false,
        message: "Mood is required",
      });
    }

    const strategies = await geminiService.generateCopingStrategies(
      mood,
      concerns || []
    );
    res.json(strategies);
  } catch (error) {
    console.error("Strategy generation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate strategies",
    });
  }
});

// Generate journal prompts
router.post("/journal-prompts", async (req, res, next) => {
  try {
    const { mood, preferences } = req.body;

    if (!mood) {
      return res.status(400).json({
        success: false,
        message: "Mood is required",
      });
    }

    const prompts = await geminiService.generateJournalPrompts(
      mood,
      preferences || []
    );
    res.json(prompts);
  } catch (error) {
    console.error("Prompt generation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate prompts",
    });
  }
});

// Crisis detection
router.post("/crisis-detection", async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    const crisis = await geminiService.detectCrisis(text);
    res.json(crisis);
  } catch (error) {
    console.error("Crisis detection error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to detect crisis",
    });
  }
});

// Create a new AI interaction (legacy)
router.post("/", async (req, res, next) => {
  try {
    const { userId, query, response } = req.body;

    if (!userId || !query || !response) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const interaction = {
      interactionId: uuidv4(),
      userId,
      query,
      response,
      timestamp: new Date().toISOString(),
    };

    const createdInteraction = await aiInteractionRepo.createInteraction(
      interaction
    );
    res.status(201).json(createdInteraction);
  } catch (error) {
    next(error);
  }
});

// Get interaction by ID
router.get("/:interactionId", async (req, res, next) => {
  try {
    const { interactionId } = req.params;
    const interaction = await aiInteractionRepo.getInteractionById(
      interactionId
    );

    if (!interaction) {
      return res.status(404).json({ message: "Interaction not found" });
    }

    res.json(interaction);
  } catch (error) {
    next(error);
  }
});

// Get all interactions for a user
router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const interactions = await aiInteractionRepo.getInteractionsByUserId(
      userId
    );
    res.json(interactions);
  } catch (error) {
    next(error);
  }
});

// Get interactions by date range
router.get("/date-range/:startDate/:endDate", async (req, res, next) => {
  try {
    const { startDate, endDate } = req.params;
    const interactions = await aiInteractionRepo.getInteractionsByDateRange(
      startDate,
      endDate
    );
    res.json(interactions);
  } catch (error) {
    next(error);
  }
});

// Get all interactions
router.get("/", async (req, res, next) => {
  try {
    const interactions = await aiInteractionRepo.getAllInteractions();
    res.json(interactions);
  } catch (error) {
    next(error);
  }
});

// Update interaction
router.put("/:interactionId", async (req, res, next) => {
  try {
    const { interactionId } = req.params;
    const updates = req.body;

    if (!updates.query && !updates.response) {
      return res
        .status(400)
        .json({ message: "At least one field must be provided for update" });
    }

    const updatedInteraction = await aiInteractionRepo.updateInteraction(
      interactionId,
      updates
    );

    if (!updatedInteraction) {
      return res.status(404).json({ message: "Interaction not found" });
    }

    res.json(updatedInteraction);
  } catch (error) {
    next(error);
  }
});

// Delete interaction
router.delete("/:interactionId", async (req, res, next) => {
  try {
    const { interactionId } = req.params;
    await aiInteractionRepo.deleteInteraction(interactionId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Delete all interactions for a user
router.delete("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    await aiInteractionRepo.deleteInteractionsByUserId(userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
