# 🚨 URGENT: Fix Nodemailer Import Error on Render

## Error You're Seeing:

```
❌ Error sending session request email: TypeError: L.default.createTransporter is not a function
```

## Root Cause:

The deployed build on Render has nodemailer bundled incorrectly by esbuild. Nodemailer needs to be external (not bundled) because it has dynamic imports.

## ✅ Solution: Rebuild and Redeploy

### Step 1: Verify package.json (Already Correct ✅)

Your build script already has `--external:nodemailer`:

```json
"build": "npx esbuild ... --external:nodemailer"
```

### Step 2: Redeploy on Render

#### Option A: Manual Deploy (Recommended)

1. Go to https://render.com
2. Open your **session-service**
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait for build to complete

#### Option B: Trigger via Git Push

```bash
cd MoodLiftBackend/session-service
git add .
git commit -m "fix: ensure nodemailer is external in build"
git push origin development
```

### Step 3: Add Environment Variables (If Not Done Yet)

In Render dashboard → Environment tab, add:

```
EMAIL_SERVICE = gmail
EMAIL_USER = infosumitkumar3322@gmail.com
EMAIL_PASS = vqwqjfbxchudawsi
USER_SERVICE_URL = https://moodliftbackend.onrender.com
FRONTEND_URL = http://localhost:3000
```

### Step 4: Verify Build Logs

After deployment, check Render logs for:

```
✅ Email credentials found, creating transporter...
```

NOT:

```
❌ L.default.createTransporter is not a function
```

---

## Alternative: Use Direct Import (If Above Doesn't Work)

If the issue persists, we can modify the import to be more explicit:

### Update emailService.js:

```javascript
import nodemailer from "nodemailer";

// Test import immediately
console.log("Nodemailer imported:", typeof nodemailer);
console.log("createTransport exists:", typeof nodemailer.createTransport);

const createTransporter = () => {
  console.log("📧 Creating email transporter...");

  if (!nodemailer || !nodemailer.createTransport) {
    console.error("❌ Nodemailer not properly imported!");
    return null;
  }

  // ... rest of code
  return nodemailer.createTransport({ ... });
};
```

---

## Why This Happens

### During Build (esbuild):

- esbuild bundles all code into one file
- Without `--external:nodemailer`, it tries to bundle nodemailer
- Nodemailer has dynamic imports that break when bundled
- Result: `createTransport` becomes undefined

### The Fix:

- Add `--external:nodemailer` to build script ✅ (Already done)
- Rebuild on Render so it uses the updated build script
- Nodemailer will be loaded as external dependency at runtime

---

## Checklist:

- [ ] Verify `package.json` has `--external:nodemailer` in build script ✅
- [ ] Verify `nodemailer` is in `dependencies` (not devDependencies) ✅
- [ ] Trigger manual deploy on Render
- [ ] Wait for build to complete
- [ ] Check Render logs for "Email credentials found"
- [ ] Test session request from frontend
- [ ] Verify email is sent (check logs)
- [ ] Check email inbox

---

## Expected Render Logs After Fix:

```
📧 Creating email transporter...
EMAIL_USER: Set
EMAIL_PASS: Set
EMAIL_SERVICE: gmail
✅ Email credentials found, creating transporter...
📤 Sending email via SMTP...
✅ Session request email sent successfully!
Message ID: <xxx@gmail.com>
```

---

## If Still Not Working:

### Check Render Build Logs:

Look for:

```
> session-service@1.0.0 build
> npx esbuild ... --external:nodemailer
```

Should show nodemailer is excluded from bundle.

### Verify Dependencies Installed:

In Render build logs, should see:

```
npm install
added XXX packages
  nodemailer@6.10.1
```

### Test Locally First:

```bash
cd MoodLiftBackend/session-service
npm run build
npm start
# Test if email works in production mode
```

---

## Quick Fix Script:

If you want to force a rebuild, run this locally then push:

```bash
cd MoodLiftBackend/session-service

# Clean old build
npm run clean

# Rebuild with correct externals
npm run build

# Test locally
npm start

# If working, commit and push
git add .
git commit -m "rebuild: fix nodemailer external dependency"
git push
```

---

**The fix is simple: Just redeploy on Render so it rebuilds with the correct external configuration! 🚀**
