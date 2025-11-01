import { Payment, Subscription, Wallet } from "../models/payment.model.js";
import { v4 as uuidv4 } from "uuid";

// Create payment intent
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const {
      amount,
      currency = "USD",
      sessionId,
      listenerId,
      paymentType,
    } = req.body;

    // Create payment record
    const payment = await Payment.create({
      paymentId: uuidv4(),
      userId,
      sessionId,
      listenerId,
      amount,
      currency,
      paymentMethod: "card",
      paymentType,
      status: "pending",
    });

    // TODO: Create Stripe payment intent
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount * 100, // Convert to cents
    //   currency,
    //   metadata: { paymentId: payment.paymentId },
    // });

    res.status(201).json({
      success: true,
      payment,
      clientSecret: "mock_client_secret", // Replace with actual Stripe secret
    });
  } catch (error) {
    next(error);
  }
};

// Confirm payment
export const confirmPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { stripePaymentIntentId } = req.body;

    const payment = await Payment.findOne({ paymentId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // TODO: Verify with Stripe
    payment.status = "completed";
    payment.stripePaymentIntentId = stripePaymentIntentId;
    payment.receipt = {
      receiptUrl: `https://moodlift.com/receipts/${paymentId}`,
      receiptNumber: `REC-${Date.now()}`,
    };

    await payment.save();

    // If it's a session payment, credit listener's wallet
    if (payment.paymentType === "session" && payment.listenerId) {
      const listenerCut = payment.amount * 0.8; // 80% to listener
      let wallet = await Wallet.findOne({ userId: payment.listenerId });

      if (!wallet) {
        wallet = await Wallet.create({
          userId: payment.listenerId,
          balance: 0,
          earnings: { totalEarned: 0, pendingPayout: 0 },
        });
      }

      await wallet.addCredit(
        listenerCut,
        `Session payment - ${payment.sessionId}`,
        payment.paymentId
      );

      wallet.earnings.totalEarned += listenerCut;
      wallet.earnings.pendingPayout += listenerCut;
      await wallet.save();
    }

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// Get payment history
export const getPaymentHistory = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { limit = 20 } = req.query;

    const payments = await Payment.getUserPayments(userId, parseInt(limit));

    res.json({
      success: true,
      payments,
      count: payments.length,
    });
  } catch (error) {
    next(error);
  }
};

// Create subscription
export const createSubscription = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { plan } = req.body;

    const plans = {
      basic: {
        amount: 9.99,
        interval: "monthly",
        benefits: {
          sessionsPerMonth: 4,
          aiChatUnlimited: false,
          prioritySupport: false,
          groupSessions: false,
          recordingSessions: false,
        },
      },
      premium: {
        amount: 29.99,
        interval: "monthly",
        benefits: {
          sessionsPerMonth: 12,
          aiChatUnlimited: true,
          prioritySupport: true,
          groupSessions: true,
          recordingSessions: false,
        },
      },
      pro: {
        amount: 49.99,
        interval: "monthly",
        benefits: {
          sessionsPerMonth: 999,
          aiChatUnlimited: true,
          prioritySupport: true,
          groupSessions: true,
          recordingSessions: true,
        },
      },
    };

    const planDetails = plans[plan];

    if (!planDetails) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan",
      });
    }

    // Check if user already has active subscription
    const existingSub = await Subscription.findOne({
      userId,
      status: "active",
    });

    if (existingSub) {
      return res.status(400).json({
        success: false,
        message: "User already has an active subscription",
      });
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription = await Subscription.create({
      subscriptionId: uuidv4(),
      userId,
      plan,
      status: "active",
      pricing: {
        amount: planDetails.amount,
        currency: "USD",
        interval: planDetails.interval,
      },
      benefits: planDetails.benefits,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    });

    res.status(201).json({
      success: true,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findOne({
      subscriptionId,
      userId,
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    subscription.cancelAtPeriodEnd = true;
    subscription.cancelledAt = new Date();
    await subscription.save();

    res.json({
      success: true,
      message: "Subscription will be cancelled at period end",
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

// Get wallet balance
export const getWalletBalance = async (req, res, next) => {
  try {
    const { userId } = req.user;

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: 0,
        earnings: { totalEarned: 0, pendingPayout: 0 },
      });
    }

    res.json({
      success: true,
      wallet,
    });
  } catch (error) {
    next(error);
  }
};

// Request payout
export const requestPayout = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { amount } = req.body;

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    if (wallet.earnings.pendingPayout < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient pending payout amount",
      });
    }

    // TODO: Process payout with Stripe Connect

    wallet.earnings.pendingPayout -= amount;
    wallet.earnings.lastPayoutAt = new Date();
    await wallet.save();

    res.json({
      success: true,
      message: "Payout request processed",
      payout: {
        amount,
        status: "processing",
        estimatedArrival: "2-3 business days",
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get listener earnings
export const getListenerEarnings = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { startDate, endDate } = req.query;

    const earnings = await Payment.getListenerEarnings(
      userId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      earnings,
    });
  } catch (error) {
    next(error);
  }
};
