import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    feedbackId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, index: true }, // Optional
    listenerId: { type: String, index: true }, // Optional - for listener feedback
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    comments: { type: String }, // Support both 'comment' and 'comments'
    category: {
      type: String,
      enum: ["session", "platform", "listener", "feature", "bug", "other"],
      default: "session",
    },
    improvements: [{ type: String }], // Array of improvement suggestions
    createdAt: { type: String, required: true },
  },
  {
    collection: "feedback",
    timestamps: false,
  }
);

export const FeedbackModel =
  mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

export const feedbackRepo = {
  async createFeedback(feedback) {
    const doc = await FeedbackModel.create(feedback);
    return doc.toObject();
  },

  async getFeedbackById(feedbackId) {
    return await FeedbackModel.findOne({ feedbackId }).lean();
  },

  async getFeedbackByUserId(userId) {
    return await FeedbackModel.find({ userId }).sort({ createdAt: -1 }).lean();
  },

  async getFeedbackBySessionId(sessionId) {
    return await FeedbackModel.find({ sessionId })
      .sort({ createdAt: -1 })
      .lean();
  },

  async updateFeedback(feedbackId, updates) {
    return await FeedbackModel.findOneAndUpdate({ feedbackId }, updates, {
      new: true,
      lean: true,
    });
  },

  async deleteFeedback(feedbackId) {
    await FeedbackModel.deleteOne({ feedbackId });
  },

  async getAllFeedback() {
    return await FeedbackModel.find().sort({ createdAt: -1 }).lean();
  },

  async getFeedbackByRating(rating) {
    return await FeedbackModel.find({ rating }).sort({ createdAt: -1 }).lean();
  },

  async getAverageRating() {
    const result = await FeedbackModel.aggregate([
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);
    return result.length > 0 ? result[0].avgRating : 0;
  },
};
