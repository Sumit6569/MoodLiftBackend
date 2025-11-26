import { v4 as uuidv4 } from "uuid";
import {
  createPayPalProduct,
  createPayPalSubscriptionPlan,
  createPayPalSubscription,
  getPayPalSubscriptionDetails,
  cancelPayPalSubscription,
} from "../services/paypal.service.js";
import { subscriptionRepo } from "../models/subscription.model.js";
import { transactionRepo } from "../models/transaction.model.js";

/**
 * Create Subscription Plan
 */
export const createPlan = async (req, res, next) => {
  try {
    const { name, description, amount, currency, interval } = req.body;

    if (!name || !amount) {
      return res.status(400).json({
        success: false,
        message: "Name and amount are required",
      });
    }

    // Create product first
    const product = await createPayPalProduct({
      name: `${name} - MoodLift`,
      description: description || `${name} subscription plan`,
      type: "SERVICE",
    });

    // Create subscription plan
    const plan = await createPayPalSubscriptionPlan({
      productId: product.id,
      name,
      description,
      amount,
      currency: currency || "USD",
      interval: interval || "MONTH",
    });

    res.status(201).json({
      success: true,
      message: "Subscription plan created successfully",
      product,
      plan,
    });
  } catch (error) {
    console.error("Create plan error:", error);
    next(error);
  }
};

/**
 * Create Subscription
 */
export const createSubscription = async (req, res, next) => {
  try {
    const { userId, planId, planName, amount, currency, interval } = req.body;

    if (!userId || !planId || !planName || !amount) {
      return res.status(400).json({
        success: false,
        message: "userId, planId, planName, and amount are required",
      });
    }

    // Check if user already has an active subscription
    const existingSubscription =
      await subscriptionRepo.getActiveSubscriptionByUserId(userId);

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: "User already has an active subscription",
        subscription: existingSubscription,
      });
    }

    // Create subscription record
    const subscriptionId = uuidv4();
    const subscription = await subscriptionRepo.createSubscription({
      subscriptionId,
      userId,
      planId,
      planName,
      status: "pending",
      amount,
      currency: currency || "USD",
      interval: interval || "MONTH",
      startDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    // Create PayPal subscription
    const paypalSubscription = await createPayPalSubscription({
      planId,
      userId,
    });

    // Update subscription with PayPal ID
    await subscriptionRepo.updateSubscription(subscriptionId, {
      paypalSubscriptionId: paypalSubscription.id,
    });

    res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      subscriptionId,
      paypalSubscriptionId: paypalSubscription.id,
      approvalUrl: paypalSubscription.links.find(
        (link) => link.rel === "approve"
      )?.href,
      subscription: paypalSubscription,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    next(error);
  }
};

/**
 * Activate Subscription (after user approval)
 */
export const activateSubscription = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await subscriptionRepo.getSubscriptionById(
      subscriptionId
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Get PayPal subscription details
    const paypalDetails = await getPayPalSubscriptionDetails(
      subscription.paypalSubscriptionId
    );

    // Update subscription status
    await subscriptionRepo.updateSubscription(subscriptionId, {
      status: paypalDetails.status === "ACTIVE" ? "active" : "pending",
      metadata: paypalDetails,
    });

    // Create transaction record for subscription activation
    await transactionRepo.createTransaction({
      transactionId: uuidv4(),
      userId: subscription.userId,
      subscriptionId,
      type: "subscription",
      status: "completed",
      amount: subscription.amount,
      currency: subscription.currency,
      description: `Subscription payment - ${subscription.planName}`,
      paymentMethod: "paypal",
    });

    res.json({
      success: true,
      message: "Subscription activated successfully",
      subscription: paypalDetails,
    });
  } catch (error) {
    console.error("Activate subscription error:", error);
    next(error);
  }
};

/**
 * Get Subscription Details
 */
export const getSubscriptionDetails = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await subscriptionRepo.getSubscriptionById(
      subscriptionId
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Get PayPal subscription details if available
    let paypalDetails = null;
    if (subscription.paypalSubscriptionId) {
      try {
        paypalDetails = await getPayPalSubscriptionDetails(
          subscription.paypalSubscriptionId
        );
      } catch (error) {
        console.error("Failed to fetch PayPal details:", error);
      }
    }

    // Get subscription transactions
    const transactions = await transactionRepo.getTransactionsBySubscriptionId(
      subscriptionId
    );

    res.json({
      success: true,
      subscription,
      paypalDetails,
      transactions,
    });
  } catch (error) {
    console.error("Get subscription details error:", error);
    next(error);
  }
};

/**
 * Get User Subscriptions
 */
export const getUserSubscriptions = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const subscriptions = await subscriptionRepo.getSubscriptionsByUserId(
      userId
    );

    res.json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error("Get user subscriptions error:", error);
    next(error);
  }
};

/**
 * Cancel Subscription
 */
export const cancelSubscription = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    const { reason } = req.body;

    const subscription = await subscriptionRepo.getSubscriptionById(
      subscriptionId
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    if (subscription.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Subscription is already cancelled",
      });
    }

    // Cancel PayPal subscription
    if (subscription.paypalSubscriptionId) {
      await cancelPayPalSubscription(
        subscription.paypalSubscriptionId,
        reason || "User requested cancellation"
      );
    }

    // Update local subscription
    await subscriptionRepo.cancelSubscription(
      subscriptionId,
      reason || "User requested cancellation"
    );

    res.json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    next(error);
  }
};

/**
 * Get All Subscriptions (Admin)
 */
export const getAllSubscriptions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : {};

    const subscriptions = await subscriptionRepo.getAllSubscriptions(filters);

    res.json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    console.error("Get all subscriptions error:", error);
    next(error);
  }
};
