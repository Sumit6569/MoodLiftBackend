# SendGrid Email Setup Guide

## Why SendGrid Instead of Gmail SMTP?

Gmail SMTP (port 587/465) often gets blocked on cloud platforms like Render due to:

- Firewall restrictions on SMTP ports
- IP address blacklisting
- Security policies blocking SMTP connections

**SendGrid uses HTTP API** instead of SMTP, which works reliably on all cloud platforms.

## Setup Steps

### 1. Create SendGrid Account

1. Go to https://sendgrid.com/
2. Sign up for **FREE account** (100 emails/day forever)
3. Verify your email address

### 2. Create API Key

1. Login to SendGrid dashboard
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name: `MoodLift Session Service`
5. Permissions: **Full Access** (or just Mail Send)
6. Click **Create & View**
7. **COPY THE API KEY** (you can only see it once!)
   - Example: `SG.abc123xyz...`

### 3. Verify Sender Email (Important!)

1. Go to **Settings** → **Sender Authentication**
2. Choose **Single Sender Verification** (easier, free)
3. Enter your email: `infosumitkumar3322@gmail.com`
4. Fill out the form (name, address, etc.)
5. Click **Create**
6. Check your email inbox
7. Click the verification link
8. Wait for approval (usually instant)

### 4. Add to Render Environment Variables

1. Login to Render.com
2. Open your **session-service** deployment
3. Go to **Environment** tab
4. Add these variables:
   ```
   SENDGRID_API_KEY=SG.your_api_key_here
   FROM_EMAIL=infosumitkumar3322@gmail.com
   USER_SERVICE_URL=https://moodliftbackend.onrender.com
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
5. Click **Save Changes**
6. Wait for auto-redeploy (3-5 minutes)

### 5. Update package.json

Add SendGrid dependency:

```json
{
  "dependencies": {
    "@sendgrid/mail": "^8.1.0",
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5"
  }
}
```

### 6. Install Locally

```bash
cd session-service
npm install @sendgrid/mail
```

## SendGrid Benefits

✅ **Works on all cloud platforms** (HTTP, not SMTP)  
✅ **Better deliverability** (dedicated email infrastructure)  
✅ **Free tier**: 100 emails/day forever  
✅ **Email tracking**: Open rates, click tracking, bounces  
✅ **No SMTP port issues** (uses HTTPS port 443)  
✅ **Professional email service** (not blocked like Gmail)

## Next Steps

After completing setup:

1. I'll update `emailService.js` to use SendGrid API
2. Test email sending locally
3. Deploy to Render
4. Verify emails arrive successfully

## Free Tier Limits

- **100 emails per day** (resets daily)
- Perfect for your use case:
  - Session request emails to listeners
  - Confirmation emails to users
  - Even with 50 sessions/day = 100 emails total

## Alternative: Resend.com

If you prefer, another great option is **Resend**:

- https://resend.com/
- 100 emails/day free
- Simpler setup
- Great for developers
- React Email templates

Let me know which service you prefer, or I can implement SendGrid now!
