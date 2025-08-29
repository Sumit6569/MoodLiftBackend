import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      required: true,
    },
    createdAt: { type: String, required: true },
  },
  {
    collection: "payments",
    timestamps: false,
  }
);

export const PaymentModel =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export const paymentRepo = {
  async createPayment(payment) {
    const doc = await PaymentModel.create(payment);
    return doc.toObject();
  },

  async getPaymentById(paymentId) {
    return await PaymentModel.findOne({ paymentId }).lean();
  },

  async getPaymentsByUserId(userId) {
    return await PaymentModel.find({ userId }).sort({ createdAt: -1 }).lean();
  },

  async getPaymentsBySessionId(sessionId) {
    return await PaymentModel.find({ sessionId })
      .sort({ createdAt: -1 })
      .lean();
  },

  async updatePayment(paymentId, updates) {
    return await PaymentModel.findOneAndUpdate({ paymentId }, updates, {
      new: true,
      lean: true,
    });
  },

  async deletePayment(paymentId) {
    await PaymentModel.deleteOne({ paymentId });
  },

  async getAllPayments() {
    return await PaymentModel.find().sort({ createdAt: -1 }).lean();
  },

  async getPaymentsByStatus(status) {
    return await PaymentModel.find({ status }).sort({ createdAt: -1 }).lean();
  },
};
