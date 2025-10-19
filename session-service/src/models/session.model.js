import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    listenerId: { type: String, required: true, index: true },
    type: { type: String, enum: ["chat", "video"], required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "active", "completed", "cancelled"],
      required: true,
      default: "pending",
    },
    startTime: { type: String, required: true },
    endTime: { type: String },
    cost: { type: Number, required: true },
    duration: { type: Number }, // in minutes
    notes: { type: String },
    listenerNotes: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    collection: "sessions",
    timestamps: false,
  }
);

export const SessionModel =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);

export const sessionRepo = {
  async createSession(session) {
    const doc = await SessionModel.create(session);
    return doc.toObject();
  },

  async getSessionById(sessionId) {
    return await SessionModel.findOne({ sessionId }).lean();
  },

  async getSessionsByUserId(userId) {
    return await SessionModel.find({ userId }).lean();
  },

  async getSessionsByListenerId(listenerId) {
    return await SessionModel.find({ listenerId }).lean();
  },

  async updateSession(sessionId, updates) {
    return await SessionModel.findOneAndUpdate({ sessionId }, updates, {
      new: true,
      lean: true,
    });
  },

  async deleteSession(sessionId) {
    await SessionModel.deleteOne({ sessionId });
  },

  async getAllSessions() {
    return await SessionModel.find().lean();
  },
};
