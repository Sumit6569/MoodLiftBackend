import dotenv from "dotenv";

dotenv.config();

export const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  mode: process.env.PAYPAL_MODE || "sandbox", // sandbox or live
  successUrl: process.env.PAYPAL_SUCCESS_URL || "http://localhost:8000/success",
  cancelUrl: process.env.PAYPAL_CANCEL_URL || "http://localhost:8000/cancel",
};

// PayPal API URLs based on mode
export const getPayPalApiUrl = () => {
  return paypalConfig.mode === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
};

// Validate PayPal configuration
export const validatePayPalConfig = () => {
  if (!paypalConfig.clientId || !paypalConfig.clientSecret) {
    throw new Error("PayPal credentials are not configured properly");
  }
  return true;
};
