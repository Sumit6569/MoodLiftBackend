import nodemailer from "nodemailer";

// Create reusable transporter
const createTransporter = () => {
  console.log("📧 Creating email transporter...");
  console.log("EMAIL_USER:", process.env.EMAIL_USER ? "Set" : "Not set");
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Set" : "Not set");
  console.log("EMAIL_SERVICE:", process.env.EMAIL_SERVICE || "gmail");

  // Check if we have email configuration
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(
      "⚠️ Email credentials not configured. Email notifications will be disabled."
    );
    console.warn("Please set EMAIL_USER and EMAIL_PASS environment variables");
    return null;
  }

  console.log("✅ Email credentials found, creating transporter...");
  return nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email for new session request to listener
export const sendSessionRequestEmail = async (
  listenerEmail,
  listenerName,
  userName,
  sessionDetails
) => {
  try {
    console.log("📧 sendSessionRequestEmail called");
    console.log("Listener Email:", listenerEmail);
    console.log("Listener Name:", listenerName);
    console.log("User Name:", userName);
    console.log("Session Details:", sessionDetails);

    const transporter = createTransporter();
    if (!transporter) {
      console.log(
        "❌ Email service not configured, skipping email notification"
      );
      return { success: false, message: "Email service not configured" };
    }

    const { sessionId, type, cost, startTime } = sessionDetails;

    console.log("📤 Preparing email...");
    const mailOptions = {
      from: `"MoodLift" <${process.env.EMAIL_USER}>`,
      to: listenerEmail,
      subject: "🔔 New Session Request - MoodLift",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: white;
                padding: 30px;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .session-details {
                background: #f5f5f5;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e0e0e0;
              }
              .detail-row:last-child {
                border-bottom: none;
              }
              .label {
                font-weight: bold;
                color: #667eea;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                text-align: center;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💜 New Session Request</h1>
              </div>
              <div class="content">
                <p>Hello <strong>${listenerName}</strong>,</p>
                
                <p>You have received a new session request from <strong>${userName}</strong>.</p>
                
                <div class="session-details">
                  <h3 style="margin-top: 0; color: #667eea;">📋 Session Details</h3>
                  <div class="detail-row">
                    <span class="label">Session ID:</span>
                    <span>${sessionId.substring(0, 8)}...</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Client:</span>
                    <span>${userName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Session Type:</span>
                    <span>${
                      type === "video" ? "🎥 Video Call" : "💬 Chat"
                    }</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Cost:</span>
                    <span>$${cost}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Requested At:</span>
                    <span>${new Date(startTime).toLocaleString()}</span>
                  </div>
                </div>
                
                <p><strong>Action Required:</strong> Please log in to your listener dashboard to review and confirm this session request. You'll need to provide:</p>
                <ul>
                  <li>📅 Scheduled date and time</li>
                  <li>⏱️ Session duration</li>
                  <li>🔗 Meeting link (for video sessions)</li>
                  <li>📝 Any instructions for the client</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="${
                    process.env.FRONTEND_URL || "http://localhost:3000"
                  }/listener-dashboard" class="button">
                    View Session Request
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  <em>Please respond to this request as soon as possible to provide the best service to your clients.</em>
                </p>
              </div>
              <div class="footer">
                <p>This is an automated email from MoodLift. Please do not reply to this email.</p>
                <p>&copy; 2025 MoodLift. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    console.log("📤 Sending email via SMTP...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Session request email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending session request email:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    return { success: false, error: error.message };
  }
};

// Send email when session is confirmed to user
export const sendSessionConfirmedEmail = async (
  userEmail,
  userName,
  listenerName,
  sessionDetails
) => {
  try {
    console.log("📧 sendSessionConfirmedEmail called");
    console.log("User Email:", userEmail);
    console.log("User Name:", userName);
    console.log("Listener Name:", listenerName);
    console.log("Session Details:", sessionDetails);

    const transporter = createTransporter();
    if (!transporter) {
      console.log(
        "❌ Email service not configured, skipping email notification"
      );
      return { success: false, message: "Email service not configured" };
    }

    const {
      sessionId,
      type,
      cost,
      scheduledStartTime,
      scheduledEndTime,
      duration,
      meetingLink,
      listenerInstructions,
    } = sessionDetails;

    const scheduledDate = scheduledStartTime
      ? new Date(scheduledStartTime).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "To be determined";

    const scheduledTime = scheduledStartTime
      ? new Date(scheduledStartTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "To be determined";

    const mailOptions = {
      from: `"MoodLift" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "✅ Your Session Has Been Confirmed - MoodLift",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .header {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: white;
                padding: 30px;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .session-details {
                background: #f0fdf4;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #10b981;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #d1fae5;
              }
              .detail-row:last-child {
                border-bottom: none;
              }
              .label {
                font-weight: bold;
                color: #059669;
              }
              .meeting-link {
                background: #10b981;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                margin: 20px 0;
                font-weight: bold;
              }
              .instructions {
                background: #fef3c7;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #f59e0b;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                text-align: center;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 12px;
              }
              .highlight {
                background: #fef3c7;
                padding: 2px 6px;
                border-radius: 3px;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Session Confirmed!</h1>
              </div>
              <div class="content">
                <p>Hello <strong>${userName}</strong>,</p>
                
                <p>Great news! Your session with <strong>${listenerName}</strong> has been confirmed.</p>
                
                <div class="session-details">
                  <h3 style="margin-top: 0; color: #059669;">📋 Session Details</h3>
                  <div class="detail-row">
                    <span class="label">Session ID:</span>
                    <span>${sessionId.substring(0, 8)}...</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Listener:</span>
                    <span>${listenerName}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Session Type:</span>
                    <span>${
                      type === "video" ? "🎥 Video Call" : "💬 Chat"
                    }</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Scheduled Date:</span>
                    <span>${scheduledDate}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Scheduled Time:</span>
                    <span>${scheduledTime}</span>
                  </div>
                  ${
                    duration
                      ? `<div class="detail-row">
                    <span class="label">Duration:</span>
                    <span>${duration} minutes</span>
                  </div>`
                      : ""
                  }
                  <div class="detail-row">
                    <span class="label">Cost:</span>
                    <span>$${cost}</span>
                  </div>
                </div>
                
                ${
                  meetingLink
                    ? `
                  <div style="text-align: center; margin: 30px 0;">
                    <p style="margin-bottom: 10px;"><strong>🔗 Join Your Session:</strong></p>
                    <a href="${meetingLink}" class="meeting-link">
                      Click Here to Join Meeting
                    </a>
                    <p style="font-size: 12px; color: #666; margin-top: 10px;">
                      Link: <a href="${meetingLink}" style="color: #10b981;">${meetingLink}</a>
                    </p>
                  </div>
                `
                    : ""
                }
                
                ${
                  listenerInstructions
                    ? `
                  <div class="instructions">
                    <h4 style="margin-top: 0; color: #f59e0b;">📝 Instructions from ${listenerName}:</h4>
                    <p style="margin: 0; white-space: pre-wrap;">${listenerInstructions}</p>
                  </div>
                `
                    : ""
                }
                
                <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top: 0; color: #2563eb;">💡 Before Your Session:</h4>
                  <ul style="margin: 0;">
                    <li>Find a quiet, comfortable space</li>
                    ${
                      type === "video"
                        ? "<li>Test your camera and microphone</li>"
                        : ""
                    }
                    <li>Have a glass of water nearby</li>
                    <li>Prepare any topics you'd like to discuss</li>
                  </ul>
                </div>
                
                <div style="text-align: center;">
                  <a href="${
                    process.env.FRONTEND_URL || "http://localhost:3000"
                  }/dashboard" class="button">
                    View in Dashboard
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  <em>If you need to reschedule or have any questions, please contact support.</em>
                </p>
              </div>
              <div class="footer">
                <p>This is an automated email from MoodLift. Please do not reply to this email.</p>
                <p>&copy; 2025 MoodLift. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    console.log("📤 Sending confirmation email via SMTP...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Session confirmed email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending session confirmed email:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    return { success: false, error: error.message };
  }
};

export default {
  sendSessionRequestEmail,
  sendSessionConfirmedEmail,
};
