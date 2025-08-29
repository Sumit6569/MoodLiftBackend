import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { chatMessageRepo } from "../models/chatMessage.model.js";

const router = Router();

// Create a new message
router.post("/", async (req, res, next) => {
  try {
    const { sessionId, senderId, content } = req.body;

    if (!sessionId || !senderId || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const message = {
      sessionId,
      messageId: uuidv4(),
      senderId,
      content,
      timestamp: new Date().toISOString(),
    };

    const createdMessage = await chatMessageRepo.createMessage(message);
    res.status(201).json(createdMessage);
  } catch (error) {
    next(error);
  }
});

// Get message by ID
router.get("/message/:messageId", async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const message = await chatMessageRepo.getMessageById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json(message);
  } catch (error) {
    next(error);
  }
});

// Get all messages for a session
router.get("/session/:sessionId", async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const messages = await chatMessageRepo.getMessagesBySessionId(sessionId);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// Get all messages by a sender
router.get("/sender/:senderId", async (req, res, next) => {
  try {
    const { senderId } = req.params;
    const messages = await chatMessageRepo.getMessagesBySenderId(senderId);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// Get all messages
router.get("/", async (req, res, next) => {
  try {
    const messages = await chatMessageRepo.getAllMessages();
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// Update message
router.put("/:messageId", async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const updates = req.body;

    if (!updates.content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const updatedMessage = await chatMessageRepo.updateMessage(
      messageId,
      updates
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json(updatedMessage);
  } catch (error) {
    next(error);
  }
});

// Delete message
router.delete("/:messageId", async (req, res, next) => {
  try {
    const { messageId } = req.params;
    await chatMessageRepo.deleteMessage(messageId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Delete all messages for a session
router.delete("/session/:sessionId", async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    await chatMessageRepo.deleteMessagesBySessionId(sessionId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
