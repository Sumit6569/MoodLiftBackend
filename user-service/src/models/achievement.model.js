import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "first_session",
        "mood_tracker_streak_7",
        "mood_tracker_streak_30",
        "helped_others_5",
        "helped_others_25",
        "helped_others_100",
        "early_bird",
        "night_owl",
        "wellness_warrior",
        "gratitude_master",
        "listener_approved",
        "community_builder",
        "progress_champion",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      default: 10,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      enum: ["engagement", "wellness", "community", "milestone"],
      default: "milestone",
    },
  },
  { timestamps: true }
);

// Get user's total points
achievementSchema.statics.getUserPoints = async function (userId) {
  const result = await this.aggregate([
    { $match: { userId } },
    { $group: { _id: null, totalPoints: { $sum: "$points" } } },
  ]);
  return result[0]?.totalPoints || 0;
};

// Check and award achievements
achievementSchema.statics.checkAndAward = async function (userId, type) {
  const achievementDefinitions = {
    first_session: {
      title: "First Step",
      description: "Completed your first session",
      icon: "🎯",
      points: 50,
      category: "milestone",
    },
    mood_tracker_streak_7: {
      title: "Week Warrior",
      description: "Tracked your mood for 7 days straight",
      icon: "🔥",
      points: 100,
      category: "wellness",
    },
    mood_tracker_streak_30: {
      title: "Month Master",
      description: "30-day mood tracking streak",
      icon: "⭐",
      points: 500,
      category: "wellness",
    },
    helped_others_5: {
      title: "Helping Hand",
      description: "Helped 5 people as a listener",
      icon: "🤝",
      points: 100,
      category: "community",
    },
    helped_others_25: {
      title: "Guardian Angel",
      description: "Completed 25 listening sessions",
      icon: "😇",
      points: 250,
      category: "community",
    },
    helped_others_100: {
      title: "Mental Health Hero",
      description: "Supported 100+ people",
      icon: "🦸",
      points: 1000,
      category: "community",
    },
    listener_approved: {
      title: "Certified Listener",
      description: "Approved as an official listener",
      icon: "✅",
      points: 200,
      category: "milestone",
    },
  };

  const existing = await this.findOne({ userId, type });
  if (existing) {
    return null; // Already awarded
  }

  const definition = achievementDefinitions[type];
  if (!definition) {
    return null;
  }

  const achievement = await this.create({
    userId,
    type,
    ...definition,
  });

  return achievement;
};

const Achievement = mongoose.model("Achievement", achievementSchema);

export default Achievement;
