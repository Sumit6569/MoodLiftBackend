import { v4 as uuidv4 } from "uuid";
import {
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalOrderDetails,
  issuePayPalRefund,
} from "../services/paypal.service.js";
import { transactionRepo } from "../models/transaction.model.js";

/**
 * Create PayPal Order
 */
export const createOrder = async (req, res, next) => {
  try {
    const { amount, currency, description, userId, metadata } = req.body;

    if (!amount || !userId) {
      return res.status(400).json({
        success: false,
        message: "Amount and userId are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // Create transaction record
    const transactionId = uuidv4();
    const transaction = await transactionRepo.createTransaction({
      transactionId,
      userId,
      type: "one-time",
      status: "pending",
      amount,
      currency: currency || "USD",
      description: description || "MoodLift Payment",
      paymentMethod: "paypal",
      metadata,
    });

    // Create PayPal order
    const paypalOrder = await createPayPalOrder({
      amount,
      currency,
      description,
      userId,
      metadata,
    });

    // Update transaction with PayPal order ID
    await transactionRepo.updateTransaction(transactionId, {
      paypalOrderId: paypalOrder.id,
    });

    res.status(201).json({
      success: true,
      message: "PayPal order created successfully",
      transactionId,
      paypalOrderId: paypalOrder.id,
      approvalUrl: paypalOrder.links.find((link) => link.rel === "approve")
        ?.href,
      order: paypalOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    next(error);
  }
};

/**
 * Capture PayPal Order
 */
export const captureOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Get transaction by PayPal order ID
    const transaction = await transactionRepo.getTransactionByPayPalOrderId(
      orderId
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Capture PayPal order
    const captureData = await capturePayPalOrder(orderId);

    // Update transaction status
    await transactionRepo.updateTransaction(transaction.transactionId, {
      status: captureData.status === "COMPLETED" ? "completed" : "failed",
      paypalCaptureId: captureData.purchase_units[0]?.payments?.captures[0]?.id,
      metadata: {
        ...transaction.metadata,
        captureData,
      },
    });

    res.json({
      success: true,
      message: "Payment captured successfully",
      transactionId: transaction.transactionId,
      status: captureData.status,
      captureData,
    });
  } catch (error) {
    console.error("Capture order error:", error);

    // Update transaction to failed if capture fails
    try {
      const transaction = await transactionRepo.getTransactionByPayPalOrderId(
        req.params.orderId
      );
      if (transaction) {
        await transactionRepo.updateTransaction(transaction.transactionId, {
          status: "failed",
          errorMessage: error.message,
        });
      }
    } catch (updateError) {
      console.error("Failed to update transaction:", updateError);
    }

    next(error);
  }
};

/**
 * Get Order Details
 */
export const getOrderDetails = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const orderDetails = await getPayPalOrderDetails(orderId);
    const transaction = await transactionRepo.getTransactionByPayPalOrderId(
      orderId
    );

    res.json({
      success: true,
      order: orderDetails,
      transaction,
    });
  } catch (error) {
    console.error("Get order details error:", error);
    next(error);
  }
};

/**
 * Issue Refund
 */
export const refundPayment = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { amount, reason } = req.body;

    const transaction = await transactionRepo.getTransactionById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Only completed transactions can be refunded",
      });
    }

    if (!transaction.paypalCaptureId) {
      return res.status(400).json({
        success: false,
        message: "PayPal capture ID not found",
      });
    }

    // Issue refund
    const refundData = await issuePayPalRefund(
      transaction.paypalCaptureId,
      amount,
      transaction.currency
    );

    // Update transaction
    await transactionRepo.updateTransaction(transactionId, {
      status: "refunded",
      refundAmount: amount || transaction.amount,
      refundReason: reason,
      refundedAt: new Date(),
      metadata: {
        ...transaction.metadata,
        refundData,
      },
    });

    res.json({
      success: true,
      message: "Refund processed successfully",
      refund: refundData,
    });
  } catch (error) {
    console.error("Refund error:", error);
    next(error);
  }
};

/**
 * Get User Transactions
 */
export const getUserTransactions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const transactions = await transactionRepo.getTransactionsByUserId(
      userId,
      parseInt(limit)
    );

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get user transactions error:", error);
    next(error);
  }
};

/**
 * Get Transaction by ID
 */
export const getTransactionById = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const transaction = await transactionRepo.getTransactionById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Get transaction error:", error);
    next(error);
  }
};

/**
 * Get Transaction Statistics
 */
export const getTransactionStats = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const stats = await transactionRepo.getTransactionStats(userId);
    const transactions = await transactionRepo.getTransactionsByUserId(userId);

    const summary = {
      totalTransactions: transactions.length,
      completedCount: transactions.filter((t) => t.status === "completed")
        .length,
      pendingCount: transactions.filter((t) => t.status === "pending").length,
      failedCount: transactions.filter((t) => t.status === "failed").length,
      refundedCount: transactions.filter((t) => t.status === "refunded").length,
      totalAmount: transactions
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0),
      totalRefunded: transactions
        .filter((t) => t.status === "refunded")
        .reduce((sum, t) => sum + t.refundAmount, 0),
    };

    res.json({
      success: true,
      stats,
      summary,
    });
  } catch (error) {
    console.error("Get transaction stats error:", error);
    next(error);
  }
};
