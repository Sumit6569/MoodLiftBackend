import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { paymentRepo } from "../models/payment.model.js";

const router = Router();

// Create a new payment
router.post("/", async (req, res, next) => {
  try {
    const { userId, sessionId, amount } = req.body;

    if (!userId || !sessionId || amount === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const payment = {
      paymentId: uuidv4(),
      userId,
      sessionId,
      amount,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const createdPayment = await paymentRepo.createPayment(payment);
    res.status(201).json(createdPayment);
  } catch (error) {
    next(error);
  }
});

// Get payment by ID
router.get("/:paymentId", async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await paymentRepo.getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);
  } catch (error) {
    next(error);
  }
});

// Get all payments for a user
router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const payments = await paymentRepo.getPaymentsByUserId(userId);
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

// Get all payments for a session
router.get("/session/:sessionId", async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const payments = await paymentRepo.getPaymentsBySessionId(sessionId);
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

// Get payments by status
router.get("/status/:status", async (req, res, next) => {
  try {
    const { status } = req.params;
    if (!["pending", "completed", "failed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const payments = await paymentRepo.getPaymentsByStatus(status);
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

// Get all payments
router.get("/", async (req, res, next) => {
  try {
    const payments = await paymentRepo.getAllPayments();
    res.json(payments);
  } catch (error) {
    next(error);
  }
});

// Update payment
router.put("/:paymentId", async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const updates = req.body;

    if (
      updates.status &&
      !["pending", "completed", "failed"].includes(updates.status)
    ) {
      return res.status(400).json({
        message: 'Status must be "pending", "completed", or "failed"',
      });
    }

    if (updates.amount !== undefined && updates.amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const updatedPayment = await paymentRepo.updatePayment(paymentId, updates);

    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(updatedPayment);
  } catch (error) {
    next(error);
  }
});

// Delete payment
router.delete("/:paymentId", async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    await paymentRepo.deletePayment(paymentId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
