import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    messageId: { type: String, required: true, unique: true, index: true },
    senderId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    timestamp: { type: String, required: true },
  },
  {
    collection: "chatMessages",
    timestamps: false,
  }
);

// Compound index for efficient querying by sessionId and timestamp
chatMessageSchema.index({ sessionId: 1, timestamp: 1 });

export const ChatMessageModel =
  mongoose.models.ChatMessage ||
  mongoose.model("ChatMessage", chatMessageSchema);

export const chatMessageRepo = {
  async createMessage(message) {
    const doc = await ChatMessageModel.create(message);
    return doc.toObject();
  },

  async getMessageById(messageId) {
    return await ChatMessageModel.findOne({ messageId }).lean();
  },

  async getMessagesBySessionId(sessionId) {
    return await ChatMessageModel.find({ sessionId })
      .sort({ timestamp: 1 })
      .lean();
  },

  async getMessagesBySenderId(senderId) {
    return await ChatMessageModel.find({ senderId })
      .sort({ timestamp: -1 })
      .lean();
  },

  async updateMessage(messageId, updates) {
    return await ChatMessageModel.findOneAndUpdate({ messageId }, updates, {
      new: true,
      lean: true,
    });
  },

  async deleteMessage(messageId) {
    await ChatMessageModel.deleteOne({ messageId });
  },

  async deleteMessagesBySessionId(sessionId) {
    await ChatMessageModel.deleteMany({ sessionId });
  },

  async getAllMessages() {
    return await ChatMessageModel.find().sort({ timestamp: -1 }).lean();
  },
};
