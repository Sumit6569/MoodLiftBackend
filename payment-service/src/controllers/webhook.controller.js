import crypto from "crypto";
import { subscriptionRepo } from "../models/subscription.model.js";
import { transactionRepo } from "../models/transaction.model.js";

/**
 * PayPal Webhook Handler
 * Handles webhook events from PayPal
 */
export const handlePayPalWebhook = async (req, res, next) => {
  try {
    const event = req.body;
    const eventType = event.event_type;

    console.log(`Received PayPal webhook: ${eventType}`);

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePaymentCaptureCompleted(event);
        break;

      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.DECLINED":
        await handlePaymentCaptureFailed(event);
        break;

      case "BILLING.SUBSCRIPTION.CREATED":
        await handleSubscriptionCreated(event);
        break;

      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleSubscriptionActivated(event);
        break;

      case "BILLING.SUBSCRIPTION.UPDATED":
        await handleSubscriptionUpdated(event);
        break;

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
        await handleSubscriptionCancelled(event);
        break;

      case "PAYMENT.SALE.COMPLETED":
        await handleSubscriptionPayment(event);
        break;

      case "PAYMENT.SALE.REFUNDED":
        await handleRefund(event);
        break;

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    next(error);
  }
};

/**
 * Handle payment capture completed
 */
async function handlePaymentCaptureCompleted(event) {
  const captureId = event.resource.id;
  const orderId = event.resource.supplementary_data?.related_ids?.order_id;

  if (orderId) {
    const transaction = await transactionRepo.getTransactionByPayPalOrderId(
      orderId
    );

    if (transaction) {
      await transactionRepo.updateTransaction(transaction.transactionId, {
        status: "completed",
        paypalCaptureId: captureId,
        metadata: {
          ...transaction.metadata,
          webhookEvent: event,
        },
      });
    }
  }
}

/**
 * Handle payment capture failed
 */
async function handlePaymentCaptureFailed(event) {
  const orderId = event.resource.supplementary_data?.related_ids?.order_id;

  if (orderId) {
    const transaction = await transactionRepo.getTransactionByPayPalOrderId(
      orderId
    );

    if (transaction) {
      await transactionRepo.updateTransaction(transaction.transactionId, {
        status: "failed",
        errorMessage: event.summary || "Payment capture failed",
        metadata: {
          ...transaction.metadata,
          webhookEvent: event,
        },
      });
    }
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(event) {
  const paypalSubscriptionId = event.resource.id;
  console.log(`Subscription created: ${paypalSubscriptionId}`);
}

/**
 * Handle subscription activated
 */
async function handleSubscriptionActivated(event) {
  const paypalSubscriptionId = event.resource.id;

  const subscription = await subscriptionRepo.getSubscriptionByPayPalId(
    paypalSubscriptionId
  );

  if (subscription) {
    await subscriptionRepo.updateSubscription(subscription.subscriptionId, {
      status: "active",
      startDate: new Date(),
    });
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(event) {
  const paypalSubscriptionId = event.resource.id;

  const subscription = await subscriptionRepo.getSubscriptionByPayPalId(
    paypalSubscriptionId
  );

  if (subscription) {
    await subscriptionRepo.updateSubscription(subscription.subscriptionId, {
      metadata: {
        ...subscription.metadata,
        lastUpdate: event,
      },
    });
  }
}

/**
 * Handle subscription cancelled
 */
async function handleSubscriptionCancelled(event) {
  const paypalSubscriptionId = event.resource.id;

  const subscription = await subscriptionRepo.getSubscriptionByPayPalId(
    paypalSubscriptionId
  );

  if (subscription && subscription.status !== "cancelled") {
    await subscriptionRepo.cancelSubscription(
      subscription.subscriptionId,
      "Cancelled via PayPal webhook"
    );
  }
}

/**
 * Handle subscription payment (recurring)
 */
async function handleSubscriptionPayment(event) {
  const paypalSubscriptionId = event.resource.billing_agreement_id;
  const amount = parseFloat(event.resource.amount.total);

  const subscription = await subscriptionRepo.getSubscriptionByPayPalId(
    paypalSubscriptionId
  );

  if (subscription) {
    // Create transaction record for recurring payment
    await transactionRepo.createTransaction({
      transactionId: crypto.randomUUID(),
      userId: subscription.userId,
      subscriptionId: subscription.subscriptionId,
      paypalCaptureId: event.resource.id,
      type: "subscription",
      status: "completed",
      amount,
      currency: event.resource.amount.currency,
      description: `Subscription payment - ${subscription.planName}`,
      paymentMethod: "paypal",
      metadata: {
        webhookEvent: event,
      },
    });

    // Update next billing date
    const nextBillingDate = new Date();
    if (subscription.interval === "MONTH") {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (subscription.interval === "YEAR") {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    await subscriptionRepo.updateSubscription(subscription.subscriptionId, {
      nextBillingDate,
    });
  }
}

/**
 * Handle refund
 */
async function handleRefund(event) {
  const saleId = event.resource.sale_id;
  const refundAmount = parseFloat(event.resource.amount.total);

  // Find transaction by capture ID
  const transactions = await transactionRepo.getAllTransactions(
    { paypalCaptureId: saleId },
    1
  );

  if (transactions.length > 0) {
    await transactionRepo.updateTransaction(transactions[0].transactionId, {
      status: "refunded",
      refundAmount,
      refundedAt: new Date(),
      metadata: {
        ...transactions[0].metadata,
        refundEvent: event,
      },
    });
  }
}
