import mongoose from "mongoose";

const aiInteractionSchema = new mongoose.Schema(
  {
    interactionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    query: { type: String, required: true },
    response: { type: String, required: true },
    timestamp: { type: String, required: true },
  },
  {
    collection: "ai_interactions",
    timestamps: false,
  }
);

// Index for efficient querying by userId and timestamp
aiInteractionSchema.index({ userId: 1, timestamp: -1 });

export const AIInteractionModel =
  mongoose.models.AIInteraction ||
  mongoose.model("AIInteraction", aiInteractionSchema);

export const aiInteractionRepo = {
  async createInteraction(interaction) {
    const doc = await AIInteractionModel.create(interaction);
    return doc.toObject();
  },

  async getInteractionById(interactionId) {
    return await AIInteractionModel.findOne({ interactionId }).lean();
  },

  async getInteractionsByUserId(userId) {
    return await AIInteractionModel.find({ userId })
      .sort({ timestamp: -1 })
      .lean();
  },

  async updateInteraction(interactionId, updates) {
    return await AIInteractionModel.findOneAndUpdate(
      { interactionId },
      updates,
      { new: true, lean: true }
    );
  },

  async deleteInteraction(interactionId) {
    await AIInteractionModel.deleteOne({ interactionId });
  },

  async deleteInteractionsByUserId(userId) {
    await AIInteractionModel.deleteMany({ userId });
  },

  async getAllInteractions() {
    return await AIInteractionModel.find().sort({ timestamp: -1 }).lean();
  },

  async getInteractionsByDateRange(startDate, endDate) {
    return await AIInteractionModel.find({
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ timestamp: -1 })
      .lean();
  },
};
