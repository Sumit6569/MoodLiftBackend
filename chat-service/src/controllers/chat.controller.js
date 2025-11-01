import { Conversation, Message } from "../models/conversation.model.js";
import { v4 as uuidv4 } from "uuid";

// Create or get conversation
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { participantId, sessionId } = req.body;

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      "participants.userId": { $all: [userId, participantId] },
      status: "active",
    });

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        conversationId: uuidv4(),
        participants: [
          { userId, role: "user" },
          { userId: participantId, role: "listener" },
        ],
        sessionId,
        unreadCount: new Map(),
      });
    }

    res.json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's conversations
export const getUserConversations = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { status = "active" } = req.query;

    const conversations = await Conversation.find({
      "participants.userId": userId,
      status,
    })
      .sort({ updatedAt: -1 })
      .limit(50);

    // Get unread counts
    for (const conv of conversations) {
      const unreadCount = await Message.getUnreadCount(
        conv.conversationId,
        userId
      );
      conv.unreadCount = conv.unreadCount || new Map();
      conv.unreadCount.set(userId, unreadCount);
    }

    res.json({
      success: true,
      conversations,
      count: conversations.length,
    });
  } catch (error) {
    next(error);
  }
};

// Send message
export const sendMessage = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { conversationId } = req.params;
    const { content, messageType = "text", attachments = [] } = req.body;

    // Verify user is participant
    const conversation = await Conversation.findOne({
      conversationId,
      "participants.userId": userId,
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send messages in this conversation",
      });
    }

    // Analyze sentiment (simple version)
    const sentiment = analyzeSentiment(content);

    // Create message
    const message = await Message.create({
      messageId: uuidv4(),
      conversationId,
      senderId: userId,
      content,
      messageType,
      attachments,
      sentiment,
      readBy: [{ userId, readAt: new Date() }],
    });

    // Update conversation
    await Conversation.findOneAndUpdate(
      { conversationId },
      {
        lastMessage: {
          content,
          timestamp: new Date(),
          senderId: userId,
        },
        updatedAt: new Date(),
      }
    );

    // TODO: Emit WebSocket event for real-time delivery

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

// Get messages
export const getMessages = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user is participant
    const conversation = await Conversation.findOne({
      conversationId,
      "participants.userId": userId,
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this conversation",
      });
    }

    const messages = await Message.getMessages(
      conversationId,
      parseInt(limit),
      before
    );

    // Mark as read
    await Message.markAsRead(conversationId, userId);

    res.json({
      success: true,
      messages: messages.reverse(),
      count: messages.length,
    });
  } catch (error) {
    next(error);
  }
};

// Delete message
export const deleteMessage = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { messageId } = req.params;

    const message = await Message.findOne({ messageId });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only sender can delete
    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    // Soft delete
    message.deleted = {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
    };

    await message.save();

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Add reaction
export const addReaction = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findOne({ messageId });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter((r) => r.userId !== userId);

    // Add new reaction
    message.reactions.push({
      userId,
      emoji,
      timestamp: new Date(),
    });

    await message.save();

    res.json({
      success: true,
      message: "Reaction added",
      reactions: message.reactions,
    });
  } catch (error) {
    next(error);
  }
};

// Simple sentiment analysis
function analyzeSentiment(text) {
  const lowerText = text.toLowerCase();

  const urgentKeywords = ["emergency", "crisis", "help", "urgent", "suicide"];
  const negativeKeywords = ["sad", "depressed", "anxious", "worried", "hurt"];
  const positiveKeywords = ["happy", "good", "better", "great", "thanks"];

  if (urgentKeywords.some((word) => lowerText.includes(word))) {
    return "urgent";
  } else if (negativeKeywords.some((word) => lowerText.includes(word))) {
    return "negative";
  } else if (positiveKeywords.some((word) => lowerText.includes(word))) {
    return "positive";
  }

  return "neutral";
}
