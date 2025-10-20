# 📧 Email Not Working? Here's Why and How to Fix It

## 🔴 The Problem

You're seeing this issue:

- ✅ Email works locally (test-email.js succeeds)
- ❌ Email doesn't work from frontend (no emails sent)

## 🎯 The Root Cause

Your **local .env file** has email configuration, but your **Render deployment** doesn't!

```
Local (.env file) ✅
├── EMAIL_SERVICE=gmail
├── EMAIL_USER=infosumitkumar3322@gmail.com
└── EMAIL_PASS=vqwqjfbxchudawsi

Render (deployed) ❌
├── EMAIL_SERVICE=❌ NOT SET
├── EMAIL_USER=❌ NOT SET
└── EMAIL_PASS=❌ NOT SET
```

## ✅ The Solution: 3 Simple Steps

### Step 1: Login to Render

Go to https://render.com and find your **session-service**

### Step 2: Add Environment Variables

Click: **Environment** tab → **Add Environment Variable**

Add these 5 variables:

| Key                | Value                                  |
| ------------------ | -------------------------------------- |
| `EMAIL_SERVICE`    | `gmail`                                |
| `EMAIL_USER`       | `infosumitkumar3322@gmail.com`         |
| `EMAIL_PASS`       | `vqwqjfbxchudawsi`                     |
| `USER_SERVICE_URL` | `https://moodliftbackend.onrender.com` |
| `FRONTEND_URL`     | `http://localhost:3000`                |

### Step 3: Save and Redeploy

Click **"Save Changes"** → Wait for automatic redeployment (2-5 min)

---

## 🧪 How to Verify It's Working

### Check 1: Render Logs (Immediately After Deployment)

Look for these messages in Render Logs tab:

```bash
✅ Good Signs:
📧 Creating email transporter...
EMAIL_USER: Set
EMAIL_PASS: Set
✅ Email credentials found, creating transporter...

❌ Bad Signs:
⚠️ Email credentials not configured
EMAIL_USER: Not set
EMAIL_PASS: Not set
```

### Check 2: Create a Session (After Deployment)

1. Go to your frontend
2. Request a session
3. Watch Render logs for:

```bash
✅ Success:
📧 Starting email notification process...
✅ Session request email sent successfully!
Message ID: <xxx@gmail.com>

❌ Failed:
❌ Email service not configured
```

### Check 3: Email Inbox

- Check listener's email (for session requests)
- Check user's email (for session confirmations)
- **Don't forget SPAM folder!**

---

## 🐛 Troubleshooting

### Issue 1: "Email service not configured"

**Cause**: Environment variables not added to Render  
**Fix**: Follow Step 2 above, make sure all 5 variables are added

### Issue 2: "Authentication failed"

**Cause**: Wrong app password or spaces in password  
**Fix**: Use `vqwqjfbxchudawsi` (NO SPACES)

### Issue 3: "User not found" or "Listener not found"

**Cause**: User/Listener ID doesn't exist in MongoDB  
**Fix**: Check database for valid user/listener records with email addresses

### Issue 4: Emails go to spam

**Cause**: Gmail's spam filter  
**Fix**:

- Mark as "Not Spam"
- Add sender to contacts
- Whitelist the email

---

## 📋 Quick Checklist

Before testing:

- [ ] Added `EMAIL_SERVICE` to Render
- [ ] Added `EMAIL_USER` to Render
- [ ] Added `EMAIL_PASS` to Render (no spaces)
- [ ] Added `USER_SERVICE_URL` to Render
- [ ] Added `FRONTEND_URL` to Render
- [ ] Clicked "Save Changes"
- [ ] Waited for redeployment to complete
- [ ] Checked Render logs show "Email credentials found"

After adding variables:

- [ ] Created test session from frontend
- [ ] Checked Render logs for success message
- [ ] Checked listener email inbox (and spam)
- [ ] Confirmed session as listener
- [ ] Checked user email inbox (and spam)

---

## 🎬 What Happens Now

### When User Requests Session:

```
Frontend → POST /api/v1/sessions
    ↓
Session Service (Render)
    ↓
Fetch User & Listener Details
    ↓
Send Email to Listener ✉️
    ↓
Listener Gets Email: "New Session Request"
```

### When Listener Confirms Session:

```
Frontend → PUT /api/v1/sessions/:id
    ↓
Session Service (Render)
    ↓
Update Session Status to "confirmed"
    ↓
Send Email to User ✉️
    ↓
User Gets Email: "Session Confirmed" with Meeting Link
```

---

## 💡 Why This Happens

**Local Development:**

- Reads `.env` file ✅
- Has email configuration ✅
- Emails work ✅

**Production (Render):**

- Doesn't have access to your local `.env` file ❌
- Needs environment variables set in Render dashboard ⚙️
- Once you add them → Emails will work ✅

---

## 🎉 Success Indicators

You'll know it's working when:

1. **Render Logs show:**

   ```
   ✅ Email credentials found, creating transporter...
   ✅ Session request email sent successfully!
   ```

2. **Listener receives email** with:

   - Subject: "🔔 New Session Request - MoodLift"
   - User's name and session details
   - Link to dashboard

3. **User receives email** with:
   - Subject: "✅ Your Session Has Been Confirmed - MoodLift"
   - Scheduled date/time
   - Meeting link button
   - Listener instructions

---

## 🆘 Still Not Working?

1. **Screenshot Render Environment Variables page** (blur sensitive values)
2. **Copy Render logs** when creating a session
3. **Check MongoDB** - verify users have email addresses
4. **Test locally** - run `node test-email.js` to confirm config is correct
5. **Regenerate App Password** if authentication fails

---

**The fix is simple: Add those 5 environment variables to Render! 🚀**
