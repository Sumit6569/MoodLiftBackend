import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriptionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    paypalSubscriptionId: { type: String, index: true }, // PayPal subscription ID
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "suspended", "pending"],
      default: "pending",
      index: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    interval: {
      type: String,
      enum: ["MONTH", "YEAR", "WEEK", "DAY"],
      default: "MONTH",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    nextBillingDate: { type: Date },
    autoRenew: { type: Boolean, default: true },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  {
    collection: "subscriptions",
    timestamps: true,
  }
);

export const SubscriptionModel =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);

export const subscriptionRepo = {
  async createSubscription(subscription) {
    const doc = await SubscriptionModel.create(subscription);
    return doc.toObject();
  },

  async getSubscriptionById(subscriptionId) {
    return await SubscriptionModel.findOne({ subscriptionId }).lean();
  },

  async getSubscriptionByPayPalId(paypalSubscriptionId) {
    return await SubscriptionModel.findOne({ paypalSubscriptionId }).lean();
  },

  async getSubscriptionsByUserId(userId) {
    return await SubscriptionModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
  },

  async getActiveSubscriptionByUserId(userId) {
    return await SubscriptionModel.findOne({ userId, status: "active" }).lean();
  },

  async updateSubscription(subscriptionId, updates) {
    return await SubscriptionModel.findOneAndUpdate(
      { subscriptionId },
      updates,
      { new: true, lean: true }
    );
  },

  async cancelSubscription(subscriptionId, reason) {
    return await SubscriptionModel.findOneAndUpdate(
      { subscriptionId },
      {
        status: "cancelled",
        cancelledAt: new Date(),
        cancelReason: reason,
        autoRenew: false,
      },
      { new: true, lean: true }
    );
  },

  async getAllSubscriptions(filters = {}) {
    return await SubscriptionModel.find(filters).sort({ createdAt: -1 }).lean();
  },
};
