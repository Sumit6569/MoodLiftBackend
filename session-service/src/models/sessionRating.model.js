import mongoose from "mongoose";

const sessionRatingSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    listenerId: {
      type: String,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      maxlength: 1000,
    },
    tags: [
      {
        type: String,
        enum: [
          "helpful",
          "empathetic",
          "professional",
          "good_listener",
          "understanding",
          "supportive",
          "knowledgeable",
          "patient",
        ],
      },
    ],
    wouldRecommend: {
      type: Boolean,
      default: true,
    },
    sessionQuality: {
      communication: { type: Number, min: 1, max: 5 },
      empathy: { type: Number, min: 1, max: 5 },
      helpfulness: { type: Number, min: 1, max: 5 },
    },
  },
  { timestamps: true }
);

// Get average rating for a listener
sessionRatingSchema.statics.getListenerRating = async function (listenerId) {
  const result = await this.aggregate([
    { $match: { listenerId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
        recommendationRate: {
          $avg: { $cond: ["$wouldRecommend", 1, 0] },
        },
      },
    },
  ]);

  return (
    result[0] || { averageRating: 0, totalRatings: 0, recommendationRate: 0 }
  );
};

// Get most common tags for a listener
sessionRatingSchema.statics.getListenerTags = async function (listenerId) {
  return this.aggregate([
    { $match: { listenerId } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);
};

const SessionRating = mongoose.model("SessionRating", sessionRatingSchema);

export default SessionRating;
