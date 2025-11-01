import { UserModel } from "../models/user.model.js";
import MoodEntry from "../models/moodEntry.model.js";

// Smart listener recommendation based on user's mood patterns and needs
export const getRecommendedListeners = async (req, res, next) => {
  try {
    const { userId } = req.user;

    // Get user's recent mood entries to understand their needs
    const recentMoods = await MoodEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Analyze user's emotional patterns
    const emotionCounts = {};
    const stressLevels = [];

    recentMoods.forEach((mood) => {
      mood.emotions?.forEach((emotion) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
      if (mood.stressLevel) {
        stressLevels.push(mood.stressLevel);
      }
    });

    const avgStress =
      stressLevels.length > 0
        ? stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length
        : 5;

    const topEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    // Get all approved listeners with their stats
    const listeners = await UserModel.find({
      role: "listener",
      isApproved: true,
    }).lean();

    // Score each listener based on compatibility
    const scoredListeners = listeners.map((listener) => {
      let score = 0;
      const expertise = listener.expertise || [];

      // Match expertise with user's emotional needs
      if (topEmotions.includes("anxious") || topEmotions.includes("stressed")) {
        if (
          expertise.includes("stress_management") ||
          expertise.includes("anxiety")
        ) {
          score += 30;
        }
      }

      if (topEmotions.includes("depressed") || topEmotions.includes("sad")) {
        if (
          expertise.includes("depression") ||
          expertise.includes("emotional_support")
        ) {
          score += 30;
        }
      }

      if (avgStress >= 7) {
        if (
          expertise.includes("crisis_support") ||
          expertise.includes("stress_management")
        ) {
          score += 20;
        }
      }

      // Boost verified listeners
      if (listener.isVerified) {
        score += 15;
      }

      // Prefer lower rates for better accessibility
      const rate = listener.hourlyRate || 50;
      if (rate <= 30) {
        score += 10;
      } else if (rate <= 50) {
        score += 5;
      }

      // Add randomness to avoid always showing same listeners
      score += Math.random() * 5;

      return {
        ...listener,
        matchScore: Math.round(score),
      };
    });

    // Sort by match score and return top recommendations
    const recommendations = scoredListeners
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.json({
      success: true,
      recommendations,
      insights: {
        topEmotions,
        averageStress: avgStress.toFixed(1),
        recommendationBasis: "Based on your recent mood patterns",
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get listener's performance stats
export const getListenerStats = async (req, res, next) => {
  try {
    const { listenerId } = req.params;

    // TODO: Get from session service
    // For now, return mock data structure
    const stats = {
      totalSessions: 0,
      averageRating: 0,
      specializations: [],
      responseTime: "< 1 hour",
      successRate: 0,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};
