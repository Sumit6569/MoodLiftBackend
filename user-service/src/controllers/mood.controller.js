import MoodEntry from "../models/moodEntry.model.js";
import Achievement from "../models/achievement.model.js";

// Analyze sentiment using simple keyword matching (can be enhanced with ML)
const analyzeSentiment = (note) => {
  if (!note) return { sentiment: "neutral", suggestions: [] };

  const positiveWords = [
    "happy",
    "joy",
    "grateful",
    "excited",
    "good",
    "better",
    "amazing",
    "wonderful",
  ];
  const negativeWords = [
    "sad",
    "depressed",
    "anxious",
    "worried",
    "hurt",
    "pain",
    "bad",
    "terrible",
  ];
  const crisisWords = [
    "suicide",
    "kill myself",
    "end it all",
    "no point",
    "harm myself",
  ];

  const lowerNote = note.toLowerCase();

  // Check for crisis keywords
  const hasCrisisWords = crisisWords.some((word) => lowerNote.includes(word));
  if (hasCrisisWords) {
    return {
      sentiment: "critical",
      suggestions: [
        "Please reach out for immediate help - you're not alone",
        "Contact emergency services or crisis hotline",
        "Talk to a trusted friend, family member, or counselor",
      ],
      concernLevel: "critical",
    };
  }

  const positiveCount = positiveWords.filter((word) =>
    lowerNote.includes(word)
  ).length;
  const negativeCount = negativeWords.filter((word) =>
    lowerNote.includes(word)
  ).length;

  let sentiment = "neutral";
  let concernLevel = "low";
  let suggestions = [];

  if (negativeCount > positiveCount + 2) {
    sentiment = "negative";
    concernLevel = "medium";
    suggestions = [
      "Consider talking to a listener about what you're feeling",
      "Practice self-care activities you enjoy",
      "Remember that it's okay to ask for help",
    ];
  } else if (positiveCount > negativeCount + 2) {
    sentiment = "positive";
    suggestions = [
      "Great to see you're doing well! Keep it up!",
      "Share your positivity with others in the community",
    ];
  } else {
    suggestions = [
      "Take time to reflect on what's affecting your mood",
      "Consider tracking patterns to understand yourself better",
    ];
  }

  return { sentiment, suggestions, concernLevel };
};

// Create mood entry
export const createMoodEntry = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const {
      mood,
      emotions,
      note,
      activities,
      sleepHours,
      stressLevel,
      energyLevel,
      weather,
      location,
    } = req.body;

    // Map mood to score
    const moodScoreMap = {
      very_bad: 1,
      bad: 2,
      neutral: 3,
      good: 4,
      very_good: 5,
    };

    const aiInsights = analyzeSentiment(note);

    const moodEntry = await MoodEntry.create({
      userId,
      mood,
      moodScore: moodScoreMap[mood],
      emotions,
      note,
      activities,
      sleepHours,
      stressLevel,
      energyLevel,
      weather,
      location,
      aiInsights,
    });

    // Check for streaks and award achievements
    const recentEntries = await MoodEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(7);

    if (recentEntries.length >= 7) {
      await Achievement.checkAndAward(userId, "mood_tracker_streak_7");
    }

    const thirtyDayEntries = await MoodEntry.find({
      userId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    if (thirtyDayEntries.length >= 30) {
      await Achievement.checkAndAward(userId, "mood_tracker_streak_30");
    }

    res.status(201).json({
      success: true,
      message: "Mood entry created successfully",
      moodEntry,
      aiInsights,
    });
  } catch (error) {
    next(error);
  }
};

// Get mood entries for user
export const getMoodEntries = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { limit = 30, startDate, endDate } = req.query;

    const query = { userId };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const entries = await MoodEntry.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      entries,
      count: entries.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get mood analytics
export const getMoodAnalytics = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { days = 30 } = req.query;

    const trends = await MoodEntry.getMoodTrends(userId, parseInt(days));
    const emotionPatterns = await MoodEntry.getEmotionPatterns(
      userId,
      parseInt(days)
    );
    const concerns = await MoodEntry.detectConcerns(userId);

    // Calculate overall statistics
    const allEntries = await MoodEntry.find({ userId });
    const avgMood =
      allEntries.reduce((sum, e) => sum + e.moodScore, 0) / allEntries.length ||
      0;
    const avgStress =
      allEntries.reduce((sum, e) => sum + (e.stressLevel || 0), 0) /
        allEntries.length || 0;
    const avgEnergy =
      allEntries.reduce((sum, e) => sum + (e.energyLevel || 0), 0) /
        allEntries.length || 0;

    res.json({
      success: true,
      analytics: {
        trends,
        emotionPatterns,
        concerns,
        statistics: {
          averageMood: avgMood.toFixed(2),
          averageStress: avgStress.toFixed(2),
          averageEnergy: avgEnergy.toFixed(2),
          totalEntries: allEntries.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get achievements
export const getUserAchievements = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const achievements = await Achievement.find({ userId }).sort({
      unlockedAt: -1,
    });
    const totalPoints = await Achievement.getUserPoints(userId);

    res.json({
      success: true,
      achievements,
      totalPoints,
      count: achievements.length,
    });
  } catch (error) {
    next(error);
  }
};

// Emergency SOS - Alert listeners
export const triggerSOS = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { message, location } = req.body;

    // Create critical mood entry
    const sosEntry = await MoodEntry.create({
      userId,
      mood: "very_bad",
      moodScore: 1,
      note: message || "Emergency SOS triggered",
      aiInsights: {
        sentiment: "critical",
        suggestions: ["Immediate support required"],
        concernLevel: "critical",
      },
    });

    // TODO: Notify available listeners
    // TODO: Send to emergency contacts
    // TODO: Log in admin dashboard

    res.json({
      success: true,
      message: "SOS triggered - help is on the way",
      sosEntry,
      emergencyContacts: [
        { name: "National Suicide Prevention Lifeline", number: "988" },
        { name: "Crisis Text Line", number: "Text HOME to 741741" },
      ],
    });
  } catch (error) {
    next(error);
  }
};
