import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    listenerId: { type: String, required: true, index: true },
    type: { type: String, enum: ["chat", "video"], required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        "rejected",
      ],
      required: true,
      default: "pending",
    },

    // Scheduling
    scheduledDate: { type: String }, // ISO 8601 date
    scheduledTime: { type: String }, // "14:00" format
    duration: { type: Number, default: 60 }, // in minutes

    // Session Details
    startTime: { type: String, required: true },
    endTime: { type: String },
    cost: { type: Number, required: true },

    // Listener provided details
    meetingLink: { type: String }, // External video call link (Zoom, Google Meet, etc)
    listenerInstructions: { type: String }, // Instructions from listener to user
    listenerNotes: { type: String }, // Private notes for listener

    // User details
    userNotes: { type: String }, // User's notes about what they want to discuss

    // Feedback
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },

    // Metadata
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
    confirmedAt: { type: String },
    completedAt: { type: String },
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
