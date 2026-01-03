import { Router } from "express";
const router = Router();

// Enhanced AI Chat endpoint (existing)
router.post("/chat", async (req, res) => {
  try {
    const { message, conversationHistory, moodData } = req.body;

    // Call Gemini AI API with enhanced context
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a compassionate AI mental health companion. Context: ${JSON.stringify(
                    moodData || {}
                  )}. Conversation history: ${JSON.stringify(
                    conversationHistory || []
                  )}. User message: ${message}. Provide empathetic, supportive, and actionable advice.`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to listen. Please tell me more.";

    res.json({ success: true, response: aiResponse });
  } catch (error) {
    console.error("AI chat error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get AI response" });
  }
});

// AI Journal Analyzer
router.post("/analyze-journal", async (req, res) => {
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

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    let analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Extract JSON from markdown code blocks if present
    analysisText = analysisText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const analysis = JSON.parse(analysisText);

    // Save analysis to database (optional)
    // await JournalAnalysis.create({ userId, journalEntry, analysis });

    res.json({ success: true, analysis });
  } catch (error) {
    console.error("Journal analysis error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to analyze journal" });
  }
});

// AI Voice Analyzer
router.post("/analyze-voice", async (req, res) => {
  try {
    const audioFile = req.files?.audio;
    const userId = req.user?.userId;

    if (!audioFile) {
      return res
        .status(400)
        .json({ success: false, error: "No audio file provided" });
    }

    // Transcribe audio using speech-to-text
    // For now, mock implementation - replace with actual STT service
    const transcript =
      "This is a mock transcript. In production, use Google Cloud Speech-to-Text or similar service.";

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

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    let analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
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
router.get("/predictive-insights", async (req, res) => {
  try {
    const { timeRange = "month" } = req.query;
    const userId = req.user?.userId;

    // Fetch user's mood history from database
    // const moodHistory = await MoodEntry.find({ userId, createdAt: { $gte: startDate } });

    // Mock data for demonstration
    const mockMoodHistory = [
      { mood: "good", emotions: ["happy", "calm"], date: "2024-01-01" },
      { mood: "neutral", emotions: ["tired", "stressed"], date: "2024-01-02" },
      // ... more entries
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

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    let insightsText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
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
router.post("/generate-goal-plan", async (req, res) => {
  try {
    const { userInput, timeframe, focusArea } = req.body;
    const userId = req.user?.userId;

    if (!userInput || userInput.trim().length < 10) {
      return res.status(400).json({
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

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    let planText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    planText = planText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const plan = JSON.parse(planText);

    // Optionally save plan to database
    // await GoalPlan.create({ userId, userInput, timeframe, focusArea, plan });

    res.json({ success: true, plan });
  } catch (error) {
    console.error("Goal planning error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to generate goal plan" });
  }
});

export default router;
