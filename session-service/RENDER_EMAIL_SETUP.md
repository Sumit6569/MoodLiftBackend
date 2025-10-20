# 🚨 IMPORTANT: Configure Email on Render.com

## Problem

Your session service is deployed on Render at `https://session-service-qtse.onrender.com`, but it doesn't have the email configuration environment variables. That's why emails aren't being sent when you create sessions from the frontend.

## Solution: Add Environment Variables to Render

### Step 1: Go to Render Dashboard

1. Open https://render.com
2. Login to your account
3. Find your **session-service** deployment
4. Click on it to open the service details

### Step 2: Add Environment Variables

1. Click on **"Environment"** tab in the left sidebar
2. Click **"Add Environment Variable"** button
3. Add these variables one by one:

#### Email Configuration:

```
Key: EMAIL_SERVICE
Value: gmail
```

```
Key: EMAIL_USER
Value: infosumitkumar3322@gmail.com
```

```
Key: EMAIL_PASS
Value: vqwqjfbxchudawsi
```

#### Service URLs:

```
Key: USER_SERVICE_URL
Value: https://moodliftbackend.onrender.com
```

```
Key: FRONTEND_URL
Value: https://your-frontend-url.com
```

_(Replace with your actual frontend URL, or use http://localhost:3000 for development)_

### Step 3: Save and Redeploy

1. Click **"Save Changes"** button
2. Render will automatically redeploy your service
3. Wait for the deployment to complete (usually 2-5 minutes)

### Step 4: Verify Email Configuration

After deployment completes, check the logs:

1. Click on **"Logs"** tab
2. Look for these messages when the service starts:

   ```
   📧 Creating email transporter...
   EMAIL_USER: Set
   EMAIL_PASS: Set
   ✅ Email credentials found, creating transporter...
   ```

3. If you see:
   ```
   ⚠️ Email credentials not configured
   ```
   Then the environment variables weren't added correctly.

## Testing After Configuration

### Test 1: Create a Session Request

1. Go to your frontend
2. Navigate to "Find Listeners"
3. Request a session with any listener
4. Check the Render logs - you should see:

   ```
   📧 Starting email notification process...
   Fetching user and listener details...
   User details fetched: user@example.com
   Listener details fetched: listener@example.com
   Sending email to listener: listener@example.com
   📤 Sending email via SMTP...
   ✅ Session request email sent successfully!
   ```

5. Check the listener's email inbox (or spam folder)

### Test 2: Confirm a Session

1. Login as a listener
2. Go to listener dashboard
3. Confirm a pending session with meeting details
4. Check the Render logs - you should see:

   ```
   📧 Starting confirmation email notification...
   Sending confirmation email to user: user@example.com
   📤 Sending confirmation email via SMTP...
   ✅ Session confirmed email sent successfully!
   ```

5. Check the user's email inbox (or spam folder)

## Important Notes

### About the App Password

- **NO SPACES**: Use `vqwqjfbxchudawsi` (not `vqwq jfbx chud awsi`)
- This is NOT your Gmail password
- This is the 16-character App Password from Google

### Security

- ✅ Environment variables are encrypted on Render
- ✅ They won't be visible in logs
- ✅ They're only accessible to your service

### If Emails Still Don't Send

1. **Check Render Logs**:

   - Look for error messages
   - Check if email credentials are loaded
   - Verify user/listener details are fetched correctly

2. **Common Issues**:

   - **"User not found"**: User ID doesn't exist in database
   - **"Listener not found"**: Listener ID doesn't exist in database
   - **"Authentication failed"**: App password is wrong
   - **"Email service not configured"**: Environment variables not set on Render

3. **Verify Email Addresses**:
   - Check MongoDB database
   - Ensure users have valid email addresses
   - Ensure listeners have valid email addresses

## Quick Checklist

- [ ] Add `EMAIL_SERVICE=gmail` to Render environment variables
- [ ] Add `EMAIL_USER=infosumitkumar3322@gmail.com` to Render
- [ ] Add `EMAIL_PASS=vqwqjfbxchudawsi` to Render (NO SPACES)
- [ ] Add `USER_SERVICE_URL=https://moodliftbackend.onrender.com` to Render
- [ ] Add `FRONTEND_URL` to Render
- [ ] Save changes and wait for redeployment
- [ ] Check Render logs for email configuration messages
- [ ] Test session request from frontend
- [ ] Check listener email inbox
- [ ] Test session confirmation
- [ ] Check user email inbox

## Debugging Steps

### If you see "Email service not configured":

```bash
# On Render, check environment variables are set:
# Settings → Environment → Should see EMAIL_USER, EMAIL_PASS, EMAIL_SERVICE
```

### If you see "User not found" or "Listener not found":

```bash
# Check MongoDB database:
# - Verify user ID exists
# - Verify listener ID exists
# - Verify both have email addresses
```

### If you see "Authentication failed":

```bash
# Double-check app password:
# - Must be: vqwqjfbxchudawsi (no spaces)
# - Generate new one if needed: https://myaccount.google.com/apppasswords
```

## Expected Render Logs (Success)

When everything is working, your Render logs should show:

```
✅ Connected to MongoDB Atlas
🚀 Session Service running on port 10000
📊 Environment: production
...
[POST /api/v1/sessions request received]
📧 Starting email notification process...
Fetching user and listener details...
User ID: abc123
Listener ID: def456
User details fetched: user@example.com
Listener details fetched: listener@example.com
Sending email to listener: listener@example.com
📧 sendSessionRequestEmail called
Listener Email: listener@example.com
📧 Creating email transporter...
EMAIL_USER: Set
EMAIL_PASS: Set
✅ Email credentials found, creating transporter...
📤 Preparing email...
📤 Sending email via SMTP...
✅ Session request email sent successfully!
Message ID: <xxx@gmail.com>
Email result: { success: true, messageId: '<xxx@gmail.com>' }
✅ Session request email sent to listener: listener@example.com
```

---

## 📞 Still Having Issues?

If emails still aren't sending after following all steps:

1. Share the Render logs (from the Logs tab)
2. Check if environment variables show up in Render dashboard
3. Verify the service redeployed after adding variables
4. Test locally first to ensure email config works
5. Check Gmail account for any blocks or warnings

**Once you add these environment variables to Render, emails will start working! 🎉**
