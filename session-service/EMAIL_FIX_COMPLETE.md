# Email Not Working - Complete Fix Guide

## Problem Summary

Emails get stuck at "📤 Sending email via SMTP..." when deployed to Render. This is because **Render blocks or restricts SMTP connections** (Gmail uses ports 587/465).

## ✅ Solution 1: Use SendGrid (RECOMMENDED)

SendGrid uses **HTTP API** instead of SMTP, so it works on ALL cloud platforms including Render.

### Why SendGrid?

- ✅ Uses HTTP (port 443) - never blocked
- ✅ Free tier: 100 emails/day forever
- ✅ Better deliverability than Gmail
- ✅ Email tracking & analytics
- ✅ Works on Render, Vercel, AWS, etc.

### Setup Steps (5 minutes)

#### 1. Create SendGrid Account

```
1. Go to https://sendgrid.com/
2. Sign up (FREE - no credit card needed)
3. Verify your email
```

#### 2. Get API Key

```
1. Login to SendGrid
2. Settings → API Keys
3. Click "Create API Key"
4. Name: MoodLift
5. Permissions: Full Access (or Mail Send)
6. COPY THE KEY (you only see it once!)
   Example: SG.abc123xyz...
```

#### 3. Verify Sender Email

```
1. Settings → Sender Authentication
2. Click "Single Sender Verification"
3. Enter: infosumitkumar3322@gmail.com
4. Fill form and submit
5. Check email inbox
6. Click verification link
7. Wait for approval (instant usually)
```

#### 4. Update .env File

```env
# Replace Gmail settings with SendGrid
SENDGRID_API_KEY=SG.your_api_key_here
FROM_EMAIL=infosumitkumar3322@gmail.com
USER_SERVICE_URL=https://moodliftbackend.onrender.com
FRONTEND_URL=https://your-frontend-url.vercel.app
```

#### 5. Install SendGrid Package

```bash
cd session-service
npm install @sendgrid/mail
```

#### 6. Switch to SendGrid Email Service

```bash
# Backup current Gmail version
Rename: emailService.js → emailService.gmail.js

# Use SendGrid version
Rename: emailService.sendgrid.js → emailService.js
```

#### 7. Test Locally

```bash
node test-email-sendgrid.js
```

Should see: `✅ Email sent successfully!`

#### 8. Deploy to Render

```
1. Login to Render.com
2. Open session-service
3. Environment tab
4. Add variables:
   SENDGRID_API_KEY=SG.your_key
   FROM_EMAIL=infosumitkumar3322@gmail.com
   USER_SERVICE_URL=https://moodliftbackend.onrender.com
   FRONTEND_URL=https://your-frontend.vercel.app
5. Save → Wait for redeploy (3-5 min)
```

#### 9. Test on Production

```
1. Create session request from frontend
2. Check listener email (may take 30 seconds)
3. Confirm session
4. Check user email
```

---

## 🔄 Solution 2: Fix Gmail SMTP (Less Reliable on Render)

If you want to keep using Gmail despite the issues:

### Option A: Try Different Port

Update `.env`:

```env
EMAIL_PORT=465
EMAIL_SECURE=true
```

Update `emailService.js`:

```javascript
return nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});
```

### Option B: Use Gmail SMTP Relay

Gmail offers SMTP relay for apps:

```
1. Google Admin Console (need Google Workspace)
2. Apps → Google Workspace → Gmail → Routing
3. Add SMTP relay service
4. Allow Render's IP addresses
```

**Note:** This requires Google Workspace (paid) and is complex.

---

## 🆚 Comparison

| Feature         | SendGrid     | Gmail SMTP              |
| --------------- | ------------ | ----------------------- |
| Works on Render | ✅ Always    | ❌ Often blocked        |
| Free Tier       | 100/day      | Unlimited (but blocked) |
| Setup Time      | 5 min        | Already done            |
| Reliability     | High         | Low on cloud hosts      |
| Deliverability  | Professional | May go to spam          |
| API Type        | HTTP         | SMTP (ports blocked)    |
| Tracking        | ✅ Built-in  | ❌ None                 |
| **Recommended** | **✅ YES**   | ❌ Not for production   |

---

## 📊 Current Status

### What's Working ✅

- Session creation
- Session confirmation
- Email templates (beautiful HTML)
- Local email sending (Gmail works locally)
- User/listener fetching
- All UI components

### What's NOT Working ❌

- Gmail SMTP on Render (timeout)
- Email delivery from deployed service

### Why Gmail Fails on Render

1. **Render blocks SMTP ports** (587, 465) to prevent spam
2. **Gmail blocks cloud IPs** - detects automated sending
3. **No SMTP relay** - Render doesn't offer SMTP relay service
4. **Firewall restrictions** - Corporate firewalls block SMTP

---

## 🎯 Recommended Solution

**Use SendGrid** because:

1. ✅ **Works everywhere** - HTTP API, no port restrictions
2. ✅ **Free forever** - 100 emails/day is plenty
3. ✅ **5 minute setup** - faster than debugging Gmail
4. ✅ **Professional** - better for production apps
5. ✅ **Reliable** - 99.9% uptime guarantee
6. ✅ **Tracking** - see which emails were opened
7. ✅ **Scalable** - upgrade if you need more emails

---

## 🚀 Quick Start (SendGrid)

```bash
# 1. Install SendGrid
npm install @sendgrid/mail

# 2. Get API key from https://sendgrid.com/
# 3. Update .env
echo "SENDGRID_API_KEY=SG.your_key" >> .env
echo "FROM_EMAIL=infosumitkumar3322@gmail.com" >> .env

# 4. Switch email service
mv src/utils/emailService.js src/utils/emailService.gmail.js
mv src/utils/emailService.sendgrid.js src/utils/emailService.js

# 5. Test locally
node test-email-sendgrid.js

# 6. Deploy to Render (add env vars in dashboard)
# 7. Done! ✅
```

---

## 🆘 Need Help?

### If SendGrid test fails:

- Check API key is correct (copy fresh one)
- Verify sender email in SendGrid dashboard
- Wait 5 minutes after email verification
- Check API key has "Mail Send" permission

### If still stuck:

- Check SendGrid logs: Monitoring → Activity
- Verify `FROM_EMAIL` matches verified sender
- Try sending to different email (not Gmail)
- Check spam folder

### Alternative Services:

- **Resend** - https://resend.com/ (100/day free)
- **Mailgun** - https://www.mailgun.com/ (5000/month free)
- **AWS SES** - Very cheap, needs AWS account

---

## ✅ Success Checklist

After switching to SendGrid, you should have:

- [ ] SendGrid account created
- [ ] API key generated and saved
- [ ] Sender email verified
- [ ] `@sendgrid/mail` installed
- [ ] `.env` updated with SendGrid credentials
- [ ] `emailService.sendgrid.js` renamed to `emailService.js`
- [ ] Local test passes (`test-email-sendgrid.js`)
- [ ] Render environment variables added
- [ ] Deployed to Render
- [ ] Session request email received by listener
- [ ] Session confirmation email received by user

---

## 📝 Files Changed

```
session-service/
├── .env (add SENDGRID_API_KEY, FROM_EMAIL)
├── package.json (add @sendgrid/mail)
├── src/utils/
│   ├── emailService.gmail.js (backup)
│   ├── emailService.js (rename from emailService.sendgrid.js)
│   └── emailService.sendgrid.js (provided)
└── test-email-sendgrid.js (new test script)
```

---

**Bottom Line:** Switch to SendGrid. It's designed for this exact use case and will save you hours of debugging SMTP issues on cloud platforms! 🚀
