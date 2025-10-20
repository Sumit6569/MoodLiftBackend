import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log("=== Email Configuration Test ===\n");

// Check environment variables
console.log("Environment Variables:");
console.log("EMAIL_SERVICE:", process.env.EMAIL_SERVICE || "Not set");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "Not set");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Set (hidden)" : "Not set");
console.log("USER_SERVICE_URL:", process.env.USER_SERVICE_URL || "Not set");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "Not set");
console.log("\n");

// Test email configuration
async function testEmailConfig() {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ ERROR: Email credentials not configured!");
      console.log("\nPlease set the following in your .env file:");
      console.log("EMAIL_SERVICE=gmail");
      console.log("EMAIL_USER=your-email@gmail.com");
      console.log("EMAIL_PASS=your-app-password");
      return;
    }

    console.log("Creating email transporter...");
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("Verifying SMTP connection...");
    await transporter.verify();
    
    console.log("✅ SUCCESS: Email configuration is valid!");
    console.log("✅ SMTP connection verified!");
    
    // Send test email
    console.log("\nSending test email...");
    const info = await transporter.sendMail({
      from: `"MoodLift Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: "✅ MoodLift Email Test - Configuration Successful",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #10b981;">✅ Email Configuration Successful!</h1>
            <p>Congratulations! Your MoodLift email notification system is properly configured.</p>
            
            <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0;">Configuration Details:</h3>
              <ul>
                <li><strong>Email Service:</strong> ${process.env.EMAIL_SERVICE || "gmail"}</li>
                <li><strong>Email User:</strong> ${process.env.EMAIL_USER}</li>
                <li><strong>Status:</strong> ✅ Working</li>
              </ul>
            </div>
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>✅ Session request emails will be sent to listeners</li>
              <li>✅ Session confirmation emails will be sent to users</li>
              <li>✅ All email notifications are now active</li>
            </ul>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              This is a test email from your MoodLift Session Service.
            </p>
          </div>
        </div>
      `,
    });

    console.log("✅ Test email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("\n📧 Check your inbox:", process.env.EMAIL_USER);
    console.log("\nIf you don't see the email:");
    console.log("1. Check your spam/junk folder");
    console.log("2. Wait a few moments (can take 1-2 minutes)");
    console.log("3. Verify the email address is correct");
    
  } catch (error) {
    console.error("\n❌ ERROR: Email configuration test failed!");
    console.error("Error details:", error.message);
    
    if (error.code === "EAUTH") {
      console.log("\n🔧 Authentication Error - Possible fixes:");
      console.log("1. Make sure you're using an App Password, not your regular password");
      console.log("2. Enable 2-Factor Authentication on your Google account");
      console.log("3. Generate a new App Password at: https://myaccount.google.com/apppasswords");
      console.log("4. Make sure the password has NO SPACES (use: vqwqjfbxchudawsi)");
    } else if (error.code === "ECONNECTION") {
      console.log("\n🔧 Connection Error - Possible fixes:");
      console.log("1. Check your internet connection");
      console.log("2. Check firewall settings");
      console.log("3. Verify EMAIL_SERVICE is set to 'gmail'");
    } else {
      console.log("\n🔧 General Error - Try:");
      console.log("1. Double-check your .env file configuration");
      console.log("2. Restart the service after making changes");
      console.log("3. Check the error message above for details");
    }
  }
}

testEmailConfig();
