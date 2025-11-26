import { Router } from "express";
import {
  createOrder,
  captureOrder,
  getOrderDetails,
  refundPayment,
  getUserTransactions,
  getTransactionById,
  getTransactionStats,
} from "../controllers/paypal.controller.js";

const router = Router();

// Create PayPal order
router.post("/orders", createOrder);

// Capture PayPal order
router.post("/orders/:orderId/capture", captureOrder);

// Get order details
router.get("/orders/:orderId", getOrderDetails);

// Refund payment
router.post("/transactions/:transactionId/refund", refundPayment);

// Get user transactions
router.get("/users/:userId/transactions", getUserTransactions);

// Get transaction by ID
router.get("/transactions/:transactionId", getTransactionById);

// Get transaction statistics
router.get("/users/:userId/stats", getTransactionStats);

export default router;
