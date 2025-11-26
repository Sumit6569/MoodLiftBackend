import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    paypalOrderId: { type: String, index: true }, // PayPal Order ID
    paypalCaptureId: { type: String, index: true }, // PayPal Capture ID
    subscriptionId: { type: String, index: true },
    type: {
      type: String,
      enum: ["payment", "refund", "subscription", "one-time"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "cancelled"],
      default: "pending",
      index: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    description: { type: String },
    paymentMethod: {
      type: String,
      enum: ["paypal", "card", "wallet"],
      default: "paypal",
    },
    refundAmount: { type: Number, default: 0 },
    refundReason: { type: String },
    refundedAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed },
    errorMessage: { type: String },
  },
  {
    collection: "transactions",
    timestamps: true,
  }
);

export const TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);

export const transactionRepo = {
  async createTransaction(transaction) {
    const doc = await TransactionModel.create(transaction);
    return doc.toObject();
  },

  async getTransactionById(transactionId) {
    return await TransactionModel.findOne({ transactionId }).lean();
  },

  async getTransactionByPayPalOrderId(paypalOrderId) {
    return await TransactionModel.findOne({ paypalOrderId }).lean();
  },

  async getTransactionsByUserId(userId, limit = 50) {
    return await TransactionModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },

  async getTransactionsBySubscriptionId(subscriptionId) {
    return await TransactionModel.find({ subscriptionId })
      .sort({ createdAt: -1 })
      .lean();
  },

  async updateTransaction(transactionId, updates) {
    return await TransactionModel.findOneAndUpdate({ transactionId }, updates, {
      new: true,
      lean: true,
    });
  },

  async getAllTransactions(filters = {}, limit = 100) {
    return await TransactionModel.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  },

  async getTransactionStats(userId) {
    const stats = await TransactionModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    return stats;
  },
};
