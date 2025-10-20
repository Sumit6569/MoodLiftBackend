# Session Service Email Notifications

This service sends automated email notifications for session requests and confirmations.

## 🔔 Email Notifications

### 1. **Session Request Email** (sent to Listener)

When a user requests a session, the listener receives an email with:

- User's name
- Session type (Video/Chat)
- Cost
- Request date/time
- Link to listener dashboard

### 2. **Session Confirmed Email** (sent to User)

When a listener confirms a session, the user receives an email with:

- Listener's name
- Scheduled date and time
- Session duration
- Meeting link (clickable button)
- Listener's instructions
- Preparation tips
- Link to user dashboard

## 📧 Email Setup

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:

   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password

3. **Update .env file**:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### Option 2: Other Email Services

#### Outlook/Hotmail

```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### Yahoo

```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

#### SendGrid (Production Recommended)

```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-api-key
```

## 🚀 Installation

1. **Install dependencies**:

```bash
cd MoodLiftBackend/session-service
npm install
```

2. **Create .env file**:

```bash
cp .env.example .env
```

3. **Configure environment variables**:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/moodlift-sessions

# Server
PORT=4005

# Services
USER_SERVICE_URL=https://moodliftbackend.onrender.com
FRONTEND_URL=http://localhost:3000

# Email (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

4. **Start the service**:

```bash
npm run dev
```

## 🧪 Testing Email Notifications

### Test Session Request Email:

```bash
curl -X POST http://localhost:4005/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-here",
    "listenerId": "listener-id-here",
    "type": "video",
    "cost": 50
  }'
```

### Test Session Confirmation Email:

```bash
curl -X PUT http://localhost:4005/api/v1/sessions/{sessionId} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed",
    "scheduledStartTime": "2025-10-25T14:00:00Z",
    "scheduledEndTime": "2025-10-25T15:00:00Z",
    "duration": 60,
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "listenerInstructions": "Please be ready 5 minutes before the session."
  }'
```

## 📋 Email Templates

The email templates are responsive and include:

- ✅ Professional gradient headers
- 📱 Mobile-responsive design
- 🎨 Color-coded status badges
- 🔗 Clickable meeting links
- 📝 Well-formatted session details
- 💡 Helpful tips and instructions

## 🔒 Security Notes

- **Never commit .env files** to version control
- Use **app passwords** instead of regular passwords
- For production, use **SendGrid** or **AWS SES**
- Keep **EMAIL_USER** and **EMAIL_PASS** secure

## ⚠️ Troubleshooting

### Email not sending:

1. Check console logs for error messages
2. Verify EMAIL_USER and EMAIL_PASS are correct
3. For Gmail, ensure 2FA is enabled and using app password
4. Check spam folder
5. Verify user/listener emails exist in database

### "Less secure app access" error (Gmail):

- This error means you need to use an **App Password**, not your regular password
- Follow the Gmail setup instructions above

### SMTP Connection timeout:

- Check your firewall settings
- Verify EMAIL_SERVICE is correct
- Try using port 587 or 465

## 📊 Email Service Status

The email service is **non-blocking** - if email fails, the API request will still succeed. This ensures the core functionality works even if email service is down.

Check logs for email status:

```bash
# Success
Session request email sent to listener: listener@example.com

# Failure
Error sending session request email: [error details]
```

## 🌟 Features

- ✅ Non-blocking email sending
- ✅ Automatic retry logic
- ✅ HTML email templates
- ✅ Mobile-responsive design
- ✅ Clickable meeting links
- ✅ Session details formatting
- ✅ Professional branding
- ✅ Error handling and logging

## 🔧 Customization

To customize email templates, edit:

- `src/utils/emailService.js`

You can modify:

- Email subject lines
- HTML templates
- Styles and colors
- Content and messaging
- Logo and branding

## 📚 API Endpoints

### Create Session (triggers listener email)

```
POST /api/v1/sessions
```

### Update Session (triggers user email when confirmed)

```
PUT /api/v1/sessions/:sessionId
```

## 🌐 Production Deployment

For production, update these environment variables on your hosting platform:

**Render.com / Railway.app:**

1. Go to Environment Variables
2. Add:
   - `EMAIL_SERVICE=gmail`
   - `EMAIL_USER=your-email@gmail.com`
   - `EMAIL_PASS=your-app-password`
   - `FRONTEND_URL=https://your-frontend-url.com`
   - `USER_SERVICE_URL=https://your-user-service-url.com`

## 📝 Notes

- Emails are sent asynchronously to avoid blocking API responses
- Failed emails are logged but don't break the application
- User and listener details are fetched from user-service API
- Email service can be disabled by not setting EMAIL_USER/EMAIL_PASS

## 💬 Support

If you encounter issues:

1. Check the console logs
2. Verify all environment variables
3. Test with a simple email service like Gmail first
4. Review the troubleshooting section above
