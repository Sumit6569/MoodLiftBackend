import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { aiInteractionRepo } from "../models/aiInteraction.model.js";
import { geminiService } from "../services/gemini.service.js";

const router = Router();

// Chat with AI
router.post("/chat", async (req, res, next) => {
  try {
    const { userId, message, conversationHistory, useMemory } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, message",
      });
    }

    // Get AI response with optional memory
    const aiResponse = await geminiService.chat(
      message,
      conversationHistory || [],
      useMemory !== false ? userId : null // Use memory by default
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
      conversationId: aiResponse.conversationId,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate response",
    });
  }
});

// Stream chat response (Server-Sent Events)
router.post("/chat/stream", async (req, res, next) => {
  try {
    const { userId, message, conversationHistory, useMemory } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, message",
      });
    }

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await geminiService.chatStream(
      message,
      conversationHistory || [],
      useMemory !== false ? userId : null
    );

    let fullResponse = "";
    for await (const chunk of stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    // Save interaction after streaming
    const interaction = {
      interactionId: uuidv4(),
      userId,
      query: message,
      response: fullResponse,
      timestamp: new Date().toISOString(),
    };
    await aiInteractionRepo.createInteraction(interaction);

    res.write(
      `data: ${JSON.stringify({
        done: true,
        interactionId: interaction.interactionId,
      })}\n\n`
    );
    res.end();
  } catch (error) {
    console.error("Stream error:", error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Get conversation memory
router.get("/memory/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const memory = geminiService.getMemory(userId);
    res.json(memory);
  } catch (error) {
    next(error);
  }
});

// Clear conversation memory
router.delete("/memory/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = geminiService.clearMemory(userId);
    res.json(result);
  } catch (error) {
    next(error);
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

// Enhanced AI Features

// AI Journal Analyzer
router.post("/analyze-journal", async (req, res, next) => {
  try {
    const { journalEntry } = req.body;
    const userId = req.user?.userId;

    if (!journalEntry || journalEntry.trim().length < 10) {
      return res
        .status(400)
        .json({ success: false, error: "Journal entry too short" });
    }

    const prompt = `Analyze this journal entry with deep emotional intelligence:

"${journalEntry}"

Provide a comprehensive analysis in JSON format with:
1. sentiment: "positive" | "negative" | "neutral" | "mixed"
2. sentimentScore: 0-100 (higher = more positive)
3. emotions: Array of { emotion: string, intensity: 0-100 }
4. themes: Array of key themes (max 5)
5. insights: Array of psychological insights (3-5 sentences each)
6. recommendations: Array of actionable recommendations
7. patterns: Array of behavioral patterns detected
8. growthAreas: Areas for personal development
9. strengths: Positive qualities and coping mechanisms identified

Be specific, compassionate, and actionable.`;

    const aiResponse = await geminiService.chat(prompt, [], null);
    let analysisText = aiResponse.response;

    // Extract JSON from markdown code blocks if present
    analysisText = analysisText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const analysis = JSON.parse(analysisText);

    res.json({ success: true, analysis });
  } catch (error) {
    console.error("Journal analysis error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to analyze journal" });
  }
});

// AI Voice Analyzer
router.post("/analyze-voice", async (req, res, next) => {
  try {
    const audioFile = req.files?.audio;
    const userId = req.user?.userId;

    if (!audioFile) {
      return res
        .status(400)
        .json({ success: false, error: "No audio file provided" });
    }

    // Mock transcript for now - in production, integrate speech-to-text
    const transcript =
      "I've been feeling really stressed lately with work and personal life. It's hard to balance everything.";

    const prompt = `Analyze this voice transcript for emotional state:

"${transcript}"

Provide comprehensive voice analysis in JSON format with:
1. transcript: The full text
2. emotionalTone: { tone: string, confidence: 0-100, indicators: string[] }
3. stressLevel: 0-100
4. sentimentScore: 0-100
5. energyLevel: 0-100
6. keyPhrases: Array of emotionally significant phrases
7. concerns: Array of areas of concern
8. suggestions: Array of personalized suggestions

Be empathetic and specific.`;

    const aiResponse = await geminiService.chat(prompt, [], null);
    let analysisText = aiResponse.response;
    analysisText = analysisText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const analysis = JSON.parse(analysisText);
    analysis.transcript = transcript;

    res.json({ success: true, analysis });
  } catch (error) {
    console.error("Voice analysis error:", error);
    res.status(500).json({ success: false, error: "Failed to analyze voice" });
  }
});

// AI Predictive Insights
router.get("/predictive-insights", async (req, res, next) => {
  try {
    const { timeRange = "month" } = req.query;
    const userId = req.user?.userId;

    // Mock mood history for demonstration
    const mockMoodHistory = [
      {
        mood: "good",
        emotions: ["happy", "calm"],
        activities: ["exercise", "meditation"],
        date: "2024-12-01",
      },
      {
        mood: "neutral",
        emotions: ["tired", "stressed"],
        activities: ["work"],
        date: "2024-12-02",
      },
      {
        mood: "good",
        emotions: ["excited", "hopeful"],
        activities: ["socializing"],
        date: "2024-12-03",
      },
      {
        mood: "bad",
        emotions: ["anxious", "overwhelmed"],
        activities: ["work"],
        date: "2024-12-04",
      },
      {
        mood: "good",
        emotions: ["calm", "grateful"],
        activities: ["family_time"],
        date: "2024-12-05",
      },
    ];

    const prompt = `Analyze this mood history data and provide predictive insights:

Mood History: ${JSON.stringify(mockMoodHistory)}
Time Range: ${timeRange}

Provide comprehensive predictive analysis in JSON format with:
1. overallWellness: 0-100 wellness score
2. patterns: Array of { pattern: string, frequency: number, correlation: string, insight: string }
3. predictions: { predictedMood: string, confidence: 0-100, factors: string[], recommendations: string[] }
4. trends: Array of { metric: string, trend: "up"|"down"|"stable", change: number, description: string }
5. triggers: Array of { trigger: string, impact: string, frequency: 0-100 }
6. achievements: Array of positive accomplishments
7. warnings: Array of concerning patterns
8. personalized_tips: Array of actionable tips

Be data-driven, specific, and encouraging.`;

    const aiResponse = await geminiService.chat(prompt, [], null);
    let insightsText = aiResponse.response;
    insightsText = insightsText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const insights = JSON.parse(insightsText);

    res.json({ success: true, insights });
  } catch (error) {
    console.error("Predictive insights error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to generate insights" });
  }
});

// AI Goal Planner
router.post("/generate-goal-plan", async (req, res, next) => {
  try {
    const { userInput, timeframe, focusArea } = req.body;
    const userId = req.user?.userId;

    if (!userInput || userInput.trim().length < 10) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Please provide more details about your goals",
        });
    }

    const prompt = `Create a personalized wellness goal plan based on:

User's Goal: "${userInput}"
Timeframe: ${timeframe}
Focus Area: ${focusArea || "General wellness"}

Provide a comprehensive goal plan in JSON format with:
1. goals: Array of 3-5 SMART goals with:
   - title: Clear goal title
   - description: Detailed description
   - category: mental_health|relationships|self_care|stress_management|personal_growth|work_life_balance
   - reasoning: Why this goal matters
   - milestones: Array of 4-6 specific milestones
   - timeframe: Realistic timeframe
   - successMetrics: How to measure success
2. strategies: Array of proven strategies to achieve goals
3. potentialChallenges: Array of { challenge: string, solution: string }
4. motivationalInsights: Array of encouraging insights

Be specific, realistic, and action-oriented.`;

    const aiResponse = await geminiService.chat(prompt, [], null);
    let planText = aiResponse.response;
    planText = planText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const plan = JSON.parse(planText);

    res.json({ success: true, plan });
  } catch (error) {
    console.error("Goal planning error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to generate goal plan" });
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
