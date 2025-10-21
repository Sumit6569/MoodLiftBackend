/**
 * Email Service using SendGrid (HTTP API - works on all cloud platforms)
 *
 * To use this instead of Gmail SMTP:
 * 1. Rename emailService.js to emailService.gmail.js
 * 2. Rename this file to emailService.js
 * 3. Install SendGrid: npm install @sendgrid/mail
 * 4. Set SENDGRID_API_KEY and FROM_EMAIL in .env
 */

import sgMail from "@sendgrid/mail";

// Initialize SendGrid
const initializeSendGrid = () => {
  console.log("📧 Initializing SendGrid...");

  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;

  console.log("SENDGRID_API_KEY:", apiKey ? "Set ✓" : "NOT SET ✗");
  console.log("FROM_EMAIL:", fromEmail || "NOT SET ✗");

  if (!apiKey) {
    console.error("❌ SENDGRID_API_KEY is not set!");
    throw new Error("SendGrid API key is required");
  }

  if (!fromEmail) {
    console.error("❌ FROM_EMAIL is not set!");
    throw new Error("FROM_EMAIL is required");
  }

  sgMail.setApiKey(apiKey);
  console.log("✅ SendGrid initialized successfully!");

  return fromEmail;
};

/**
 * Send session request email to listener
 */
export async function sendSessionRequestEmail(
  listenerEmail,
  listenerName,
  userName,
  sessionDetails
) {
  try {
    console.log("📧 sendSessionRequestEmail called");
    console.log("Listener Email:", listenerEmail);
    console.log("Listener Name:", listenerName);
    console.log("User Name:", userName);

    const fromEmail = initializeSendGrid();

    // Format date and time
    const sessionDate = sessionDetails.preferredDate
      ? new Date(sessionDetails.preferredDate).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Not specified";

    const sessionTime = sessionDetails.preferredTime || "Not specified";

    // Create email message
    const msg = {
      to: listenerEmail,
      from: {
        email: fromEmail,
        name: "MoodLift Support",
      },
      subject: `New Session Request from ${userName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Session Request</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                🎯 New Session Request
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Someone needs your support
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; font-size: 18px; color: #2d3748; line-height: 1.6;">
                Hi <strong style="color: #667eea;">${listenerName}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #4a5568; line-height: 1.6;">
                You have received a new session request from <strong>${userName}</strong>. 
                Please review the details below and respond as soon as possible.
              </p>

              <!-- Session Details Card -->
              <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border-left: 4px solid #667eea; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #2d3748; font-weight: 600;">
                  📋 Session Details
                </h2>

                <div style="margin-bottom: 15px;">
                  <div style="display: inline-block; min-width: 140px; color: #718096; font-size: 14px; font-weight: 600;">
                    👤 User Name:
                  </div>
                  <span style="color: #2d3748; font-size: 15px; font-weight: 500;">
                    ${userName}
                  </span>
                </div>

                <div style="margin-bottom: 15px;">
                  <div style="display: inline-block; min-width: 140px; color: #718096; font-size: 14px; font-weight: 600;">
                    📅 Preferred Date:
                  </div>
                  <span style="color: #2d3748; font-size: 15px; font-weight: 500;">
                    ${sessionDate}
                  </span>
                </div>

                <div style="margin-bottom: 15px;">
                  <div style="display: inline-block; min-width: 140px; color: #718096; font-size: 14px; font-weight: 600;">
                    ⏰ Preferred Time:
                  </div>
                  <span style="color: #2d3748; font-size: 15px; font-weight: 500;">
                    ${sessionTime}
                  </span>
                </div>

                ${
                  sessionDetails.reason
                    ? `
                <div>
                  <div style="color: #718096; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                    💭 Reason:
                  </div>
                  <div style="background: white; padding: 15px; border-radius: 8px; color: #2d3748; font-size: 15px; line-height: 1.6; border: 1px solid #e2e8f0;">
                    ${sessionDetails.reason}
                  </div>
                </div>
                `
                    : ""
                }
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }/dashboard?tab=sessions" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                  Review & Confirm Session →
                </a>
              </div>

              <!-- Instructions -->
              <div style="background: #fffaf0; border: 1px solid #fbd38d; border-radius: 12px; padding: 20px; margin-top: 30px;">
                <div style="font-size: 16px; color: #744210; font-weight: 600; margin-bottom: 10px;">
                  📝 Next Steps:
                </div>
                <ol style="margin: 0; padding-left: 20px; color: #744210; font-size: 14px; line-height: 1.8;">
                  <li>Review the session request details</li>
                  <li>Click the button above to access your dashboard</li>
                  <li>Confirm the session with a meeting link and time</li>
                  <li>The user will be notified automatically</li>
                </ol>
              </div>

            </div>

            <!-- Footer -->
            <div style="background: #f7fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px;">
                Thank you for being part of the MoodLift community! 💜
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                MoodLift Support Platform • Helping people connect and heal
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    };

    console.log("📤 Sending email via SendGrid HTTP API...");

    // SendGrid returns a response array
    const [response] = await sgMail.send(msg);

    console.log("✅ Session request email sent successfully via SendGrid!");
    console.log("Status Code:", response.statusCode);
    console.log("Response:", response.statusMessage || "OK");

    return {
      success: true,
      statusCode: response.statusCode,
      provider: "SendGrid",
    };
  } catch (error) {
    console.error("❌ Error sending session request email:", error);

    if (error.response) {
      console.error("SendGrid Error Response:", error.response.body);
    }

    return { success: false, error: error.message };
  }
}

/**
 * Send session confirmation email to user
 */
export async function sendSessionConfirmedEmail(
  userEmail,
  userName,
  listenerName,
  sessionDetails
) {
  try {
    console.log("📧 sendSessionConfirmedEmail called");
    console.log("User Email:", userEmail);
    console.log("User Name:", userName);
    console.log("Listener Name:", listenerName);

    const fromEmail = initializeSendGrid();

    // Format date and time
    const scheduledDate = sessionDetails.scheduledStartTime
      ? new Date(sessionDetails.scheduledStartTime).toLocaleDateString(
          "en-US",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )
      : "Not specified";

    const scheduledTime = sessionDetails.scheduledStartTime
      ? new Date(sessionDetails.scheduledStartTime).toLocaleTimeString(
          "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        )
      : "Not specified";

    const endTime = sessionDetails.scheduledEndTime
      ? new Date(sessionDetails.scheduledEndTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Not specified";

    const meetingLink = sessionDetails.meetingLink || "#";
    const instructions =
      sessionDetails.listenerInstructions || "No special instructions";

    // Create email message
    const msg = {
      to: userEmail,
      from: {
        email: fromEmail,
        name: "MoodLift Support",
      },
      subject: `Session Confirmed with ${listenerName} ✓`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Session Confirmed</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Session Confirmed!
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Your session has been scheduled
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; font-size: 18px; color: #2d3748; line-height: 1.6;">
                Hi <strong style="color: #667eea;">${userName}</strong>,
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; color: #4a5568; line-height: 1.6;">
                Great news! <strong>${listenerName}</strong> has confirmed your session request. 
                Here are your session details:
              </p>

              <!-- Session Details Card -->
              <div style="background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%); border-left: 4px solid #48bb78; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #2d3748; font-weight: 600;">
                  📋 Session Details
                </h2>

                <div style="margin-bottom: 15px;">
                  <div style="display: inline-block; min-width: 140px; color: #718096; font-size: 14px; font-weight: 600;">
                    👨‍⚕️ Listener:
                  </div>
                  <span style="color: #2d3748; font-size: 15px; font-weight: 500;">
                    ${listenerName}
                  </span>
                </div>

                <div style="margin-bottom: 15px;">
                  <div style="display: inline-block; min-width: 140px; color: #718096; font-size: 14px; font-weight: 600;">
                    📅 Date:
                  </div>
                  <span style="color: #2d3748; font-size: 15px; font-weight: 500;">
                    ${scheduledDate}
                  </span>
                </div>

                <div style="margin-bottom: 15px;">
                  <div style="display: inline-block; min-width: 140px; color: #718096; font-size: 14px; font-weight: 600;">
                    ⏰ Time:
                  </div>
                  <span style="color: #2d3748; font-size: 15px; font-weight: 500;">
                    ${scheduledTime} - ${endTime}
                  </span>
                </div>

                <div style="margin-bottom: 15px;">
                  <div style="display: inline-block; min-width: 140px; color: #718096; font-size: 14px; font-weight: 600;">
                    🔗 Meeting Link:
                  </div>
                  <a href="${meetingLink}" 
                     style="color: #667eea; font-size: 15px; font-weight: 500; text-decoration: none; word-break: break-all;">
                    ${meetingLink}
                  </a>
                </div>

                <div>
                  <div style="color: #718096; font-size: 14px; font-weight: 600; margin-bottom: 8px;">
                    📝 Instructions from ${listenerName}:
                  </div>
                  <div style="background: white; padding: 15px; border-radius: 8px; color: #2d3748; font-size: 15px; line-height: 1.6; border: 1px solid #c6f6d5;">
                    ${instructions}
                  </div>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${meetingLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px rgba(72, 187, 120, 0.4); transition: all 0.3s ease;">
                  Join Meeting at Scheduled Time →
                </a>
              </div>

              <!-- Tips -->
              <div style="background: #ebf8ff; border: 1px solid #90cdf4; border-radius: 12px; padding: 20px; margin-top: 30px;">
                <div style="font-size: 16px; color: #2c5282; font-weight: 600; margin-bottom: 10px;">
                  💡 Tips for Your Session:
                </div>
                <ul style="margin: 0; padding-left: 20px; color: #2c5282; font-size: 14px; line-height: 1.8;">
                  <li>Find a quiet, private space for your session</li>
                  <li>Test your internet connection and camera beforehand</li>
                  <li>Join 5 minutes early to check your setup</li>
                  <li>Have a glass of water nearby</li>
                  <li>Be open and honest during your session</li>
                </ul>
              </div>

              <!-- Calendar Reminder -->
              <div style="background: #fffaf0; border: 1px solid #fbd38d; border-radius: 12px; padding: 20px; margin-top: 20px;">
                <div style="font-size: 14px; color: #744210; text-align: center;">
                  ⏰ <strong>Set a reminder:</strong> We recommend adding this session to your calendar to ensure you don't miss it!
                </div>
              </div>

            </div>

            <!-- Footer -->
            <div style="background: #f7fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px;">
                We're here to support you on your journey 💜
              </p>
              <p style="margin: 0 0 15px 0; color: #a0aec0; font-size: 12px;">
                MoodLift Support Platform • Helping people connect and heal
              </p>
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                Need to reschedule? Visit your 
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }/dashboard?tab=sessions" 
                   style="color: #667eea; text-decoration: none;">
                  dashboard
                </a>
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    };

    console.log("📤 Sending confirmation email via SendGrid HTTP API...");

    // SendGrid returns a response array
    const [response] = await sgMail.send(msg);

    console.log(
      "✅ Session confirmation email sent successfully via SendGrid!"
    );
    console.log("Status Code:", response.statusCode);
    console.log("Response:", response.statusMessage || "OK");

    return {
      success: true,
      statusCode: response.statusCode,
      provider: "SendGrid",
    };
  } catch (error) {
    console.error("❌ Error sending session confirmation email:", error);

    if (error.response) {
      console.error("SendGrid Error Response:", error.response.body);
    }

    return { success: false, error: error.message };
  }
}
