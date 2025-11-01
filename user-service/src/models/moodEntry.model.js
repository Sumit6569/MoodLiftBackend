import mongoose from "mongoose";

const moodEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    mood: {
      type: String,
      required: true,
      enum: ["very_bad", "bad", "neutral", "good", "very_good"],
    },
    moodScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    emotions: [
      {
        type: String,
        enum: [
          "happy",
          "sad",
          "anxious",
          "stressed",
          "angry",
          "calm",
          "excited",
          "depressed",
          "hopeful",
          "lonely",
          "grateful",
          "overwhelmed",
        ],
      },
    ],
    note: {
      type: String,
      maxlength: 1000,
    },
    activities: [
      {
        type: String,
        enum: [
          "work",
          "exercise",
          "socializing",
          "relaxing",
          "sleeping",
          "eating",
          "studying",
          "hobbies",
          "family_time",
          "meditation",
        ],
      },
    ],
    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
    },
    stressLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    energyLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    weather: {
      type: String,
      enum: ["sunny", "cloudy", "rainy", "snowy", "stormy"],
    },
    location: {
      type: String,
      enum: ["home", "work", "school", "outdoors", "traveling", "other"],
    },
    aiInsights: {
      sentiment: String,
      suggestions: [String],
      concernLevel: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
      },
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
moodEntrySchema.index({ userId: 1, createdAt: -1 });
moodEntrySchema.index({ userId: 1, moodScore: 1 });

// Get mood trends for a user
moodEntrySchema.statics.getMoodTrends = async function (userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        averageMood: { $avg: "$moodScore" },
        averageStress: { $avg: "$stressLevel" },
        averageEnergy: { $avg: "$energyLevel" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// Get most common emotions
moodEntrySchema.statics.getEmotionPatterns = async function (
  userId,
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: startDate },
      },
    },
    { $unwind: "$emotions" },
    {
      $group: {
        _id: "$emotions",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
};

// Check for concerning patterns
moodEntrySchema.statics.detectConcerns = async function (userId) {
  const recentEntries = await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(7);

  const concerns = [];

  // Check for consistently low mood
  const avgMood =
    recentEntries.reduce((sum, entry) => sum + entry.moodScore, 0) /
    recentEntries.length;
  if (avgMood < 2.5) {
    concerns.push({
      type: "low_mood",
      severity: "high",
      message: "Consistently low mood detected over the past week",
    });
  }

  // Check for high stress
  const highStressCount = recentEntries.filter(
    (e) => e.stressLevel >= 8
  ).length;
  if (highStressCount >= 4) {
    concerns.push({
      type: "high_stress",
      severity: "medium",
      message: "Elevated stress levels detected",
    });
  }

  // Check for critical AI insights
  const criticalInsights = recentEntries.filter(
    (e) => e.aiInsights?.concernLevel === "critical"
  ).length;
  if (criticalInsights > 0) {
    concerns.push({
      type: "crisis_detected",
      severity: "critical",
      message: "Crisis indicators detected - immediate support recommended",
    });
  }

  return concerns;
};

const MoodEntry = mongoose.model("MoodEntry", moodEntrySchema);

export default MoodEntry;
