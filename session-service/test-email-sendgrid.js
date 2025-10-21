/**
 * SendGrid Email Configuration Test
 *
 * This script tests SendGrid email sending
 *
 * Before running:
 * 1. Create SendGrid account at https://sendgrid.com/
 * 2. Create API key
 * 3. Verify sender email
 * 4. Add to .env:
 *    SENDGRID_API_KEY=SG.your_api_key_here
 *    FROM_EMAIL=infosumitkumar3322@gmail.com
 *
 * Run: node test-email-sendgrid.js
 */

import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";

// Load environment variables
dotenv.config();

async function testSendGrid() {
  console.log("\n🧪 Testing SendGrid Email Configuration...\n");

  try {
    // Check environment variables
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    console.log("📋 Configuration Check:");
    console.log("SENDGRID_API_KEY:", apiKey ? "✓ Set" : "✗ NOT SET");
    console.log("FROM_EMAIL:", fromEmail || "✗ NOT SET");
    console.log("");

    if (!apiKey) {
      console.error("❌ SENDGRID_API_KEY is not set in .env file");
      console.log("\n💡 To fix:");
      console.log("1. Create SendGrid account: https://sendgrid.com/");
      console.log("2. Generate API key in Settings → API Keys");
      console.log("3. Add to .env: SENDGRID_API_KEY=SG.your_api_key_here");
      process.exit(1);
    }

    if (!fromEmail) {
      console.error("❌ FROM_EMAIL is not set in .env file");
      console.log("\n💡 To fix:");
      console.log("Add to .env: FROM_EMAIL=infosumitkumar3322@gmail.com");
      process.exit(1);
    }

    // Initialize SendGrid
    sgMail.setApiKey(apiKey);
    console.log("✅ SendGrid initialized\n");

    // Create test email
    const msg = {
      to: fromEmail, // Send to yourself
      from: {
        email: fromEmail,
        name: "MoodLift Support",
      },
      subject: "✅ SendGrid Test Email - MoodLift",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f7fafc; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #667eea; margin: 0 0 20px 0;">🎉 SendGrid Test Successful!</h1>
            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              If you're reading this, your SendGrid configuration is working correctly!
            </p>
            <div style="background: #ebf8ff; border-left: 4px solid #3182ce; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #2c5282; font-size: 14px;">
                <strong>Test Details:</strong><br>
                Sent via: SendGrid HTTP API<br>
                From: ${fromEmail}<br>
                Time: ${new Date().toLocaleString()}<br>
                Status: ✅ Delivered
              </p>
            </div>
            <p style="color: #718096; font-size: 14px; margin-top: 30px;">
              MoodLift Session Service • Email Notification System
            </p>
          </div>
        </body>
        </html>
      `,
      text: `SendGrid Test Email\n\nIf you're reading this, your SendGrid configuration is working!\n\nSent at: ${new Date().toLocaleString()}`,
    };

    console.log("📤 Sending test email via SendGrid...");
    console.log(`To: ${fromEmail}`);
    console.log(`From: ${fromEmail}`);
    console.log("");

    // Send email
    const [response] = await sgMail.send(msg);

    console.log("✅ Email sent successfully!");
    console.log(`Status Code: ${response.statusCode}`);
    console.log("");

    console.log("🎉 SendGrid Configuration Test: PASSED");
    console.log("");
    console.log("📧 Check your inbox at:", fromEmail);
    console.log("   (Check spam folder if you don't see it)");
    console.log("");
    console.log("✅ You can now use SendGrid for session emails!");
    console.log("");
  } catch (error) {
    console.error("\n❌ SendGrid Test Failed!");
    console.error("Error:", error.message);

    if (error.code === 401 || error.code === 403) {
      console.log("\n💡 Possible issues:");
      console.log("1. Invalid API key");
      console.log('2. API key doesn\'t have "Mail Send" permission');
      console.log("3. Sender email not verified in SendGrid");
    }

    if (error.response) {
      console.error("\nSendGrid Response:");
      console.error(JSON.stringify(error.response.body, null, 2));
    }

    console.log("\n📚 Troubleshooting:");
    console.log("1. Check API key in SendGrid dashboard");
    console.log("2. Verify sender email in Settings → Sender Authentication");
    console.log(
      '3. Make sure API key has "Full Access" or "Mail Send" permission'
    );
    console.log("");

    process.exit(1);
  }
}

// Run test
testSendGrid();
