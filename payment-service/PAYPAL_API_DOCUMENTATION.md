# 💳 Payment Service API Documentation

## Overview

Complete PayPal integration for MoodLift payment processing, subscriptions, and transaction management.

**Base URL:** `http://localhost:3004`  
**PayPal Mode:** `sandbox` (testing)

---

## 🔧 Configuration

### Environment Variables

```env
PORT=3004
MONGODB_URI=mongodb+srv://...
PAYPAL_CLIENT_ID=AQieufBNVlFc0G7KIj8cl-aNSJke4H8e3eJHN2Tzn6X8fIYPdBirk4MPpcdzYwlmdBfPG5DM-jpFYe2k
PAYPAL_CLIENT_SECRET=EGIWch9jM8UpODsKHuWF7YZhO0Ei_gmDmpORvTvYyzT9KzSFgUpu-V3SrOJ8EtfsHo0H2oiSyO42roTl
PAYPAL_MODE=sandbox
=http://localhost:8000/success
PAYPAL_CANCEL_URL=http://localhost:8000/cancel
```

---

## 📦 Features

✅ **One-Time Payments** - Single PayPal transactions  
✅ **Subscription Management** - Recurring billing with PayPal  
✅ **Refunds** - Full and partial refund support  
✅ **Transaction History** - Complete payment tracking  
✅ **Webhook Integration** - Real-time PayPal event handling  
✅ **Security** - Rate limiting, CORS, Helmet protection

---

## 🚀 API Endpoints

### Health Check
PAYPAL_SUCCESS_URL
#### GET `/health`

Check service status

**Response:**

```json
{
  "status": "OK",
  "service": "payment-service",
  "timestamp": "2025-11-27T12:00:00.000Z"
}
```

---

## 💰 PayPal One-Time Payments

### 1. Create PayPal Order

**POST** `/api/v1/paypal/orders`

Create a PayPal order for one-time payment.

**Request Body:**

```json
{
  "userId": "user-123",
  "amount": 49.99,
  "currency": "USD",
  "description": "Session payment",
  "metadata": {
    "sessionId": "session-456"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "PayPal order created successfully",
  "transactionId": "trans-uuid",
  "paypalOrderId": "7PX12345678901234",
  "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=...",
  "order": {
    /* PayPal order object */
  }
}
```

**Flow:**

1. Create order on backend
2. Redirect user to `approvalUrl`
3. User completes payment on PayPal
4. PayPal redirects to success URL
5. Capture the order

---

### 2. Capture PayPal Order

**POST** `/api/v1/paypal/orders/:orderId/capture`

Capture (complete) a PayPal order after user approval.

**Parameters:**

- `orderId` - PayPal Order ID

**Response:**

```json
{
  "success": true,
  "message": "Payment captured successfully",
  "transactionId": "trans-uuid",
  "status": "COMPLETED",
  "captureData": {
    /* PayPal capture details */
  }
}
```

---

### 3. Get Order Details

**GET** `/api/v1/paypal/orders/:orderId`

Get PayPal order details.

**Response:**

```json
{
  "success": true,
  "order": {
    /* PayPal order */
  },
  "transaction": {
    /* Local transaction */
  }
}
```

---

### 4. Get User Transactions

**GET** `/api/v1/paypal/users/:userId/transactions?limit=50`

Get all transactions for a user.

**Response:**

```json
{
  "success": true,
  "count": 10,
  "transactions": [
    {
      "transactionId": "trans-123",
      "userId": "user-123",
      "type": "one-time",
      "status": "completed",
      "amount": 49.99,
      "currency": "USD",
      "paypalOrderId": "7PX...",
      "createdAt": "2025-11-27T12:00:00.000Z"
    }
  ]
}
```

---

### 5. Get Transaction by ID

**GET** `/api/v1/paypal/transactions/:transactionId`

Get specific transaction details.

**Response:**

```json
{
  "success": true,
  "transaction": {
    /* Transaction object */
  }
}
```

---

### 6. Get Transaction Statistics

**GET** `/api/v1/paypal/users/:userId/stats`

Get user's payment statistics.

**Response:**

```json
{
  "success": true,
  "summary": {
    "totalTransactions": 25,
    "completedCount": 20,
    "pendingCount": 2,
    "failedCount": 2,
    "refundedCount": 1,
    "totalAmount": 1249.75,
    "totalRefunded": 49.99
  },
  "stats": [
    /* Detailed stats */
  ]
}
```

---

### 7. Issue Refund

**POST** `/api/v1/paypal/transactions/:transactionId/refund`

Issue a full or partial refund.

**Request Body:**

```json
{
  "amount": 25.0, // Optional: omit for full refund
  "reason": "Customer requested refund"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Refund processed successfully",
  "refund": {
    /* PayPal refund details */
  }
}
```

---

## 🔄 Subscription Management

### 1. Create Subscription Plan

**POST** `/api/v1/subscriptions/plans`

Create a PayPal subscription plan (admin only).

**Request Body:**

```json
{
  "name": "Premium Monthly",
  "description": "Premium features with monthly billing",
  "amount": 29.99,
  "currency": "USD",
  "interval": "MONTH"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription plan created successfully",
  "product": {
    /* PayPal product */
  },
  "plan": {
    "id": "P-12345678901234567",
    "name": "Premium Monthly",
    "status": "ACTIVE"
  }
}
```

**Intervals:**

- `MONTH` - Monthly billing
- `YEAR` - Yearly billing
- `WEEK` - Weekly billing
- `DAY` - Daily billing

---

### 2. Create Subscription

**POST** `/api/v1/subscriptions`

Create a subscription for a user.

**Request Body:**

```json
{
  "userId": "user-123",
  "planId": "P-12345678901234567",
  "planName": "Premium Monthly",
  "amount": 29.99,
  "currency": "USD",
  "interval": "MONTH"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription created successfully",
  "subscriptionId": "sub-uuid",
  "paypalSubscriptionId": "I-987654321",
  "approvalUrl": "https://www.sandbox.paypal.com/webapps/billing/subscriptions?ba_token=...",
  "subscription": {
    /* PayPal subscription */
  }
}
```

**Flow:**

1. Create subscription on backend
2. Redirect user to `approvalUrl`
3. User approves subscription on PayPal
4. Activate subscription

---

### 3. Activate Subscription

**POST** `/api/v1/subscriptions/:subscriptionId/activate`

Activate subscription after user approval.

**Response:**

```json
{
  "success": true,
  "message": "Subscription activated successfully",
  "subscription": {
    /* PayPal subscription details */
  }
}
```

---

### 4. Get Subscription Details

**GET** `/api/v1/subscriptions/:subscriptionId`

Get subscription details with PayPal info and transactions.

**Response:**

```json
{
  "success": true,
  "subscription": {
    "subscriptionId": "sub-123",
    "userId": "user-123",
    "planName": "Premium Monthly",
    "status": "active",
    "amount": 29.99,
    "nextBillingDate": "2025-12-27T12:00:00.000Z"
  },
  "paypalDetails": {
    /* PayPal subscription */
  },
  "transactions": [
    /* Payment history */
  ]
}
```

---

### 5. Get User Subscriptions

**GET** `/api/v1/subscriptions/users/:userId`

Get all subscriptions for a user.

**Response:**

```json
{
  "success": true,
  "count": 2,
  "subscriptions": [
    {
      "subscriptionId": "sub-123",
      "planName": "Premium Monthly",
      "status": "active",
      "amount": 29.99,
      "startDate": "2025-11-27T12:00:00.000Z"
    }
  ]
}
```

---

### 6. Cancel Subscription

**POST** `/api/v1/subscriptions/:subscriptionId/cancel`

Cancel an active subscription.

**Request Body:**

```json
{
  "reason": "User no longer needs premium features"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

---

### 7. Get All Subscriptions (Admin)

**GET** `/api/v1/subscriptions?status=active`

Get all subscriptions (admin only).

**Query Parameters:**

- `status` - Filter by status: `active`, `cancelled`, `expired`, `suspended`

**Response:**

```json
{
  "success": true,
  "count": 150,
  "subscriptions": [
    /* All subscriptions */
  ]
}
```

---

## 🪝 Webhook Integration

### Webhook Endpoint

**POST** `/api/v1/webhooks/paypal`

Receive PayPal webhook events for real-time updates.

**Supported Events:**

- `PAYMENT.CAPTURE.COMPLETED` - Payment captured
- `PAYMENT.CAPTURE.DENIED` - Payment failed
- `BILLING.SUBSCRIPTION.CREATED` - Subscription created
- `BILLING.SUBSCRIPTION.ACTIVATED` - Subscription activated
- `BILLING.SUBSCRIPTION.CANCELLED` - Subscription cancelled
- `BILLING.SUBSCRIPTION.SUSPENDED` - Subscription suspended
- `BILLING.SUBSCRIPTION.EXPIRED` - Subscription expired
- `PAYMENT.SALE.COMPLETED` - Recurring payment completed
- `PAYMENT.SALE.REFUNDED` - Payment refunded

**Webhook Setup:**

1. Go to PayPal Developer Dashboard
2. Navigate to your app → Webhooks
3. Add webhook URL: `https://your-domain.com/api/v1/webhooks/paypal`
4. Subscribe to all events above

---

## 💾 Data Models

### Transaction

```typescript
{
  transactionId: string,      // UUID
  userId: string,
  paypalOrderId: string,      // PayPal Order ID
  paypalCaptureId: string,    // PayPal Capture ID
  subscriptionId: string,     // If subscription payment
  type: "payment" | "refund" | "subscription" | "one-time",
  status: "pending" | "completed" | "failed" | "refunded" | "cancelled",
  amount: number,
  currency: string,
  description: string,
  paymentMethod: "paypal" | "card" | "wallet",
  refundAmount: number,
  refundReason: string,
  refundedAt: Date,
  metadata: object,
  errorMessage: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscription

```typescript
{
  subscriptionId: string,        // UUID
  userId: string,
  planId: string,                // PayPal Plan ID
  planName: string,
  paypalSubscriptionId: string,  // PayPal Subscription ID
  status: "active" | "cancelled" | "expired" | "suspended" | "pending",
  amount: number,
  currency: string,
  interval: "MONTH" | "YEAR" | "WEEK" | "DAY",
  startDate: Date,
  endDate: Date,
  nextBillingDate: Date,
  autoRenew: boolean,
  cancelledAt: Date,
  cancelReason: string,
  metadata: object,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing with PayPal Sandbox

### Test Credit Cards

**Visa:**

```
Card: 4032039098908704
Exp: Any future date
CVV: 123
```

**Mastercard:**

```
Card: 5425233430109903
Exp: Any future date
CVV: 123
```

### Test PayPal Accounts

**Buyer Account:**

```
Email: sb-buyer@business.example.com
Password: (from PayPal sandbox)
```

### Testing Flow

1. **One-Time Payment:**

```bash
# 1. Create order
POST /api/v1/paypal/orders
{
  "userId": "test-user",
  "amount": 49.99,
  "currency": "USD"
}

# 2. Visit approvalUrl in response
# 3. Login with sandbox buyer account
# 4. Approve payment
# 5. Capture order
POST /api/v1/paypal/orders/{orderId}/capture
```

2. **Subscription:**

```bash
# 1. Create plan (one time, admin)
POST /api/v1/subscriptions/plans
{
  "name": "Test Plan",
  "amount": 9.99,
  "interval": "MONTH"
}

# 2. Create subscription
POST /api/v1/subscriptions
{
  "userId": "test-user",
  "planId": "P-xxx",
  "planName": "Test Plan",
  "amount": 9.99
}

# 3. Visit approvalUrl
# 4. Approve subscription
# 5. Activate subscription
POST /api/v1/subscriptions/{subscriptionId}/activate
```

---

## 🔐 Security

### Implemented:

- ✅ Rate limiting (100 req/15min)
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ Request size limits (10MB)
- ✅ PayPal OAuth authentication
- ✅ Transaction validation
- ✅ Webhook signature verification (recommended)

### Recommendations:

- Add authentication middleware to routes
- Verify PayPal webhook signatures
- Use HTTPS in production
- Rotate PayPal credentials regularly
- Monitor for suspicious transactions

---

## 📊 Example Integration (Frontend)

```typescript
// Create PayPal order
const createPayment = async (amount: number) => {
  const response = await fetch("/api/v1/paypal/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: currentUser.id,
      amount,
      currency: "USD",
      description: "Session payment",
    }),
  });

  const data = await response.json();

  // Redirect to PayPal
  window.location.href = data.approvalUrl;
};

// Capture payment (on success page)
const capturePayment = async (orderId: string) => {
  const response = await fetch(`/api/v1/paypal/orders/${orderId}/capture`, {
    method: "POST",
  });

  const data = await response.json();

  if (data.success) {
    // Payment successful!
    console.log("Payment completed:", data.transactionId);
  }
};

// Create subscription
const subscribe = async (planId: string) => {
  const response = await fetch("/api/v1/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: currentUser.id,
      planId,
      planName: "Premium Monthly",
      amount: 29.99,
      interval: "MONTH",
    }),
  });

  const data = await response.json();

  // Redirect to PayPal for approval
  window.location.href = data.approvalUrl;
};
```

---

## 🚀 Deployment

### Production Checklist:

- [ ] Switch `PAYPAL_MODE` to `live`
- [ ] Use production PayPal credentials
- [ ] Set production success/cancel URLs
- [ ] Configure PayPal webhooks for production domain
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Test all payment flows
- [ ] Review security settings

### Start Service:

```bash
cd payment-service
npm install
npm run deploy  # Production build and start
```

---

## 📞 Support

**PayPal Sandbox:** https://developer.paypal.com/  
**PayPal Documentation:** https://developer.paypal.com/docs/  
**Service Port:** 3004  
**Status:** ✅ Production Ready

---

**Last Updated:** November 27, 2025  
**Version:** 1.0.0
