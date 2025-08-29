import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { aiInteractionRepo } from "../models/aiInteraction.model.js";

const router = Router();

// Create a new AI interaction
router.post("/", async (req, res, next) => {
  try {
    const { userId, query, response } = req.body;

    if (!userId || !query || !response) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const interaction = {
      interactionId: uuidv4(),
      userId,
      query,
      response,
      timestamp: new Date().toISOString(),
    };

    const createdInteraction = await aiInteractionRepo.createInteraction(
      interaction
    );
    res.status(201).json(createdInteraction);
  } catch (error) {
    next(error);
  }
});

// Get interaction by ID
router.get("/:interactionId", async (req, res, next) => {
  try {
    const { interactionId } = req.params;
    const interaction = await aiInteractionRepo.getInteractionById(
      interactionId
    );

    if (!interaction) {
      return res.status(404).json({ message: "Interaction not found" });
    }

    res.json(interaction);
  } catch (error) {
    next(error);
  }
});

// Get all interactions for a user
router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const interactions = await aiInteractionRepo.getInteractionsByUserId(
      userId
    );
    res.json(interactions);
  } catch (error) {
    next(error);
  }
});

// Get interactions by date range
router.get("/date-range/:startDate/:endDate", async (req, res, next) => {
  try {
    const { startDate, endDate } = req.params;
    const interactions = await aiInteractionRepo.getInteractionsByDateRange(
      startDate,
      endDate
    );
    res.json(interactions);
  } catch (error) {
    next(error);
  }
});

// Get all interactions
router.get("/", async (req, res, next) => {
  try {
    const interactions = await aiInteractionRepo.getAllInteractions();
    res.json(interactions);
  } catch (error) {
    next(error);
  }
});

// Update interaction
router.put("/:interactionId", async (req, res, next) => {
  try {
    const { interactionId } = req.params;
    const updates = req.body;

    if (!updates.query && !updates.response) {
      return res
        .status(400)
        .json({ message: "At least one field must be provided for update" });
    }

    const updatedInteraction = await aiInteractionRepo.updateInteraction(
      interactionId,
      updates
    );

    if (!updatedInteraction) {
      return res.status(404).json({ message: "Interaction not found" });
    }

    res.json(updatedInteraction);
  } catch (error) {
    next(error);
  }
});

// Delete interaction
router.delete("/:interactionId", async (req, res, next) => {
  try {
    const { interactionId } = req.params;
    await aiInteractionRepo.deleteInteraction(interactionId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Delete all interactions for a user
router.delete("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    await aiInteractionRepo.deleteInteractionsByUserId(userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
