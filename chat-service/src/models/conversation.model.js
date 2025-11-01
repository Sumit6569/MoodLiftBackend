import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    participants: [
      {
        userId: { type: String, required: true },
        role: { type: String, enum: ["user", "listener"] },
        name: String,
        lastSeen: Date,
      },
    ],
    sessionId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
    lastMessage: {
      content: String,
      timestamp: Date,
      senderId: String,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    metadata: {
      tags: [String],
      priority: { type: String, enum: ["low", "medium", "high", "urgent"] },
      aiAssisted: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    senderName: String,
    content: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "voice", "video", "system"],
      default: "text",
    },
    attachments: [
      {
        url: String,
        type: String,
        name: String,
        size: Number,
      },
    ],
    readBy: [
      {
        userId: String,
        readAt: Date,
      },
    ],
    reactions: [
      {
        userId: String,
        emoji: String,
        timestamp: Date,
      },
    ],
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    aiContext: {
      model: String,
      confidence: Number,
      suggestions: [String],
    },
    edited: {
      isEdited: { type: Boolean, default: false },
      editedAt: Date,
      originalContent: String,
    },
    deleted: {
      isDeleted: { type: Boolean, default: false },
      deletedAt: Date,
      deletedBy: String,
    },
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral", "urgent"],
    },
  },
  { timestamps: true }
);

// Indexes for performance
conversationSchema.index({ "participants.userId": 1, status: 1 });
conversationSchema.index({ updatedAt: -1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });

// Get unread messages count
messageSchema.statics.getUnreadCount = async function (conversationId, userId) {
  return this.countDocuments({
    conversationId,
    senderId: { $ne: userId },
    "readBy.userId": { $ne: userId },
    "deleted.isDeleted": false,
  });
};

// Mark messages as read
messageSchema.statics.markAsRead = async function (conversationId, userId) {
  return this.updateMany(
    {
      conversationId,
      senderId: { $ne: userId },
      "readBy.userId": { $ne: userId },
    },
    {
      $push: {
        readBy: {
          userId,
          readAt: new Date(),
        },
      },
    }
  );
};

// Get conversation messages with pagination
messageSchema.statics.getMessages = async function (
  conversationId,
  limit = 50,
  before = null
) {
  const query = {
    conversationId,
    "deleted.isDeleted": false,
  };

  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  return this.find(query).sort({ createdAt: -1 }).limit(limit);
};

const Conversation = mongoose.model("Conversation", conversationSchema);
const Message = mongoose.model("Message", messageSchema);

export { Conversation, Message };
