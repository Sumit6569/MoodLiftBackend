import { paypalConfig, getPayPalApiUrl } from "../config/paypal.config.js";

/**
 * Get PayPal OAuth Access Token
 */
export async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${paypalConfig.clientId}:${paypalConfig.clientSecret}`
  ).toString("base64");

  const response = await fetch(`${getPayPalApiUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal auth failed: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Create PayPal Order
 */
export async function createPayPalOrder(orderData) {
  const accessToken = await getPayPalAccessToken();
  const { amount, currency = "USD", description, userId, metadata } = orderData;

  const order = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
        description: description || "MoodLift Payment",
        custom_id: userId,
      },
    ],
    application_context: {
      brand_name: "MoodLift",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: paypalConfig.successUrl,
      cancel_url: paypalConfig.cancelUrl,
    },
  };

  const response = await fetch(`${getPayPalApiUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal order creation failed: ${error}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Capture PayPal Order
 */
export async function capturePayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalApiUrl()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal order capture failed: ${error}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Get PayPal Order Details
 */
export async function getPayPalOrderDetails(orderId) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalApiUrl()}/v2/checkout/orders/${orderId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get PayPal order details: ${error}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Create PayPal Subscription Plan
 */
export async function createPayPalSubscriptionPlan(planData) {
  const accessToken = await getPayPalAccessToken();
  const {
    name,
    description,
    amount,
    currency = "USD",
    interval = "MONTH",
  } = planData;

  const plan = {
    product_id: planData.productId, // You need to create a product first
    name,
    description,
    billing_cycles: [
      {
        frequency: {
          interval_unit: interval,
          interval_count: 1,
        },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0, // 0 = infinite
        pricing_scheme: {
          fixed_price: {
            value: amount.toFixed(2),
            currency_code: currency,
          },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee: {
        value: "0",
        currency_code: currency,
      },
      setup_fee_failure_action: "CONTINUE",
      payment_failure_threshold: 3,
    },
  };

  const response = await fetch(`${getPayPalApiUrl()}/v1/billing/plans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(plan),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal plan creation failed: ${error}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Create PayPal Product (required for subscriptions)
 */
export async function createPayPalProduct(productData) {
  const accessToken = await getPayPalAccessToken();
  const { name, description, type = "SERVICE" } = productData;

  const product = {
    name,
    description,
    type,
    category: "SOFTWARE",
  };

  const response = await fetch(`${getPayPalApiUrl()}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal product creation failed: ${error}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Create PayPal Subscription
 */
export async function createPayPalSubscription(subscriptionData) {
  const accessToken = await getPayPalAccessToken();
  const { planId, userId } = subscriptionData;

  const subscription = {
    plan_id: planId,
    custom_id: userId,
    application_context: {
      brand_name: "MoodLift",
      locale: "en-US",
      user_action: "SUBSCRIBE_NOW",
      payment_method: {
        payer_selected: "PAYPAL",
        payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
      },
      return_url: paypalConfig.successUrl,
      cancel_url: paypalConfig.cancelUrl,
    },
  };

  const response = await fetch(
    `${getPayPalApiUrl()}/v1/billing/subscriptions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(subscription),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal subscription creation failed: ${error}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Get PayPal Subscription Details
 */
export async function getPayPalSubscriptionDetails(subscriptionId) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalApiUrl()}/v1/billing/subscriptions/${subscriptionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get PayPal subscription details: ${error}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Cancel PayPal Subscription
 */
export async function cancelPayPalSubscription(
  subscriptionId,
  reason = "User requested cancellation"
) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `${getPayPalApiUrl()}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        reason,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal subscription cancellation failed: ${error}`);
  }

  return { success: true, message: "Subscription cancelled successfully" };
}

/**
 * Issue PayPal Refund
 */
export async function issuePayPalRefund(
  captureId,
  amount = null,
  currency = "USD"
) {
  const accessToken = await getPayPalAccessToken();

  const refundData = amount
    ? {
        amount: {
          value: amount.toFixed(2),
          currency_code: currency,
        },
      }
    : {}; // Empty object for full refund

  const response = await fetch(
    `${getPayPalApiUrl()}/v2/payments/captures/${captureId}/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(refundData),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal refund failed: ${error}`);
  }

  const data = await response.json();
  return data;
}
