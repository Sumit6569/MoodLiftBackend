/**
 * Email Service for User Service using SendGrid
 */

import sgMail from "@sendgrid/mail";

// Initialize SendGrid
const initializeSendGrid = () => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;

  if (!apiKey) {
    console.error("❌ SENDGRID_API_KEY is not set!");
    throw new Error("SendGrid API key is required");
  }

  if (!fromEmail) {
    console.error("❌ FROM_EMAIL is not set!");
    throw new Error("FROM_EMAIL is required");
  }

  sgMail.setApiKey(apiKey);
  return fromEmail;
};

/**
 * Send listener approval email
 */
export async function sendListenerApprovalEmail(listenerEmail, listenerName) {
  try {
    console.log("📧 sendListenerApprovalEmail called");
    console.log("Listener Email:", listenerEmail);
    console.log("Listener Name:", listenerName);

    const fromEmail = initializeSendGrid();

    const msg = {
      to: listenerEmail,
      from: {
        email: fromEmail,
        name: "MoodLift Support",
      },
      subject: "🎉 Congratulations! Your Listener Account is Approved",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Listener Approved</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 10px;">🎉</div>
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Congratulations!
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 18px;">
                Your Listener Account is Approved
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; font-size: 18px; color: #2d3748; line-height: 1.6;">
                Hi <strong style="color: #667eea;">${listenerName}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #4a5568; line-height: 1.6;">
                We're excited to inform you that your application to become a <strong>MoodLift Listener</strong> has been approved! 🎊
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #4a5568; line-height: 1.6;">
                You can now start receiving session requests from users who need your support and guidance.
              </p>

              <!-- What's Next Card -->
              <div style="background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%); border-left: 4px solid #48bb78; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #2d3748; font-weight: 600;">
                  🚀 What's Next?
                </h2>

                <div style="margin-bottom: 15px;">
                  <div style="color: #2d3748; font-size: 15px; line-height: 1.8;">
                    <strong>1. Complete Your Profile</strong><br>
                    <span style="color: #718096;">Add a professional photo, detailed bio, and expertise areas</span>
                  </div>
                </div>

                <div style="margin-bottom: 15px;">
                  <div style="color: #2d3748; font-size: 15px; line-height: 1.8;">
                    <strong>2. Set Your Availability</strong><br>
                    <span style="color: #718096;">Update your schedule and hourly rate</span>
                  </div>
                </div>

                <div style="margin-bottom: 15px;">
                  <div style="color: #2d3748; font-size: 15px; line-height: 1.8;">
                    <strong>3. Start Receiving Sessions</strong><br>
                    <span style="color: #718096;">Users can now find you and request sessions</span>
                  </div>
                </div>

                <div>
                  <div style="color: #2d3748; font-size: 15px; line-height: 1.8;">
                    <strong>4. Check Your Dashboard</strong><br>
                    <span style="color: #718096;">View pending session requests and manage bookings</span>
                  </div>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(72, 187, 120, 0.4);">
                  Go to Dashboard →
                </a>
              </div>

              <!-- Best Practices -->
              <div style="background: #ebf8ff; border: 1px solid #90cdf4; border-radius: 12px; padding: 20px; margin-top: 30px;">
                <div style="font-size: 16px; color: #2c5282; font-weight: 600; margin-bottom: 10px;">
                  💡 Tips for Success:
                </div>
                <ul style="margin: 0; padding-left: 20px; color: #2c5282; font-size: 14px; line-height: 1.8;">
                  <li>Be responsive to session requests</li>
                  <li>Maintain a professional and empathetic approach</li>
                  <li>Keep your availability calendar up to date</li>
                  <li>Provide clear meeting links and instructions</li>
                  <li>Follow up after sessions when appropriate</li>
                </ul>
              </div>

              <!-- Welcome Message -->
              <div style="background: #fffaf0; border: 1px solid #fbd38d; border-radius: 12px; padding: 20px; margin-top: 20px;">
                <div style="font-size: 14px; color: #744210; text-align: center;">
                  Welcome to the <strong>MoodLift Listener Community</strong>! 💜<br>
                  Together, we're making a difference in people's lives.
                </div>
              </div>

            </div>

            <!-- Footer -->
            <div style="background: #f7fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px;">
                Thank you for joining MoodLift as a Listener! 💜
              </p>
              <p style="margin: 0 0 15px 0; color: #a0aec0; font-size: 12px;">
                MoodLift Support Platform • Helping people connect and heal
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                Questions? Contact us at 
                <a href="mailto:${fromEmail}" style="color: #667eea; text-decoration: none;">
                  ${fromEmail}
                </a>
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    };

    console.log("📤 Sending listener approval email via SendGrid...");

    const [response] = await sgMail.send(msg);

    console.log("✅ Listener approval email sent successfully!");
    console.log("Status Code:", response.statusCode);

    return {
      success: true,
      statusCode: response.statusCode,
      provider: "SendGrid",
    };
  } catch (error) {
    console.error("❌ Error sending listener approval email:", error);

    if (error.response) {
      console.error("SendGrid Error Response:", error.response.body);
    }

    return { success: false, error: error.message };
  }
}
