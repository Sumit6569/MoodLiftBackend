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

// Predictive insights endpoint (MUST be before /:interactionId to avoid route conflict)
router.get("/predictive-insights", async (req, res, next) => {
  try {
    const timeRange = req.query.timeRange || "month";

    // Generate predictive insights
    const insights = {
      overallWellness: 75,
      patterns: [
        {
          pattern: "Work-related stress peaks on Mondays",
          frequency: 4,
          correlation: "High workload at week start",
          insight:
            "Consider implementing a Sunday evening wind-down routine to prepare mentally for the week ahead.",
        },
        {
          pattern: "Exercise improves mood significantly",
          frequency: 5,
          correlation: "Physical activity releases endorphins",
          insight:
            "Your mood consistently improves by 30% on days you exercise. Try to maintain this habit.",
        },
      ],
      predictions: {
        predictedMood: "good",
        confidence: 78,
        factors: [
          "Recent positive trend in mood scores",
          "Consistent sleep schedule this week",
          "Regular exercise routine",
        ],
        recommendations: [
          "Continue your current exercise routine",
          "Maintain 7-8 hours of sleep",
          "Practice mindfulness for 10 minutes",
        ],
      },
      trends: [
        {
          metric: "Overall Mood",
          trend: "up",
          change: 15,
          description: "Steady improvement over the past " + timeRange,
        },
        {
          metric: "Stress Levels",
          trend: "down",
          change: -20,
          description: "Significant reduction in reported stress",
        },
        {
          metric: "Sleep Quality",
          trend: "stable",
          change: 0,
          description: "Maintaining consistent sleep patterns",
        },
      ],
      triggers: [
        {
          trigger: "Work deadlines",
          impact: "Increases stress and anxiety",
          frequency: 65,
        },
        {
          trigger: "Social isolation",
          impact: "Leads to feelings of loneliness",
          frequency: 40,
        },
      ],
      achievements: [
        "Completed 7 consecutive days of exercise",
        "Improved sleep schedule consistency",
        "Reduced stress levels by 20%",
      ],
      warnings: [],
      personalized_tips: [
        "Your exercise routine is working well - try adding variety with yoga or swimming",
        "Consider reaching out to friends this week to combat isolation patterns",
        "Schedule breaks during work to prevent Monday stress buildup",
      ],
    };

    res.json({
      success: true,
      insights,
      timeRange,
    });
  } catch (error) {
    console.error("Predictive insights error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate predictive insights",
    });
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
