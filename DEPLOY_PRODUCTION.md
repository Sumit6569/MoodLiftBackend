# Deploy Updated Backend to Production

## Changes Made Locally That Need Deployment:

1. ✅ CORS updated to allow all origins (`origin: "*"`)
2. ✅ Admin routes added (`/api/v1/admin/*`)
3. ✅ Token storage fixed (stores as both `authToken` and `token`)

## Deploy to Production Server:

### Option 1: SSH and Pull Changes

```bash
# SSH into your EC2 server
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to backend directory
cd /path/to/MoodLiftBackend

# Pull latest changes (if using Git)
git pull origin main

# Restart services
pm2 restart all
# OR if using systemd
sudo systemctl restart moodlift-*
# OR if using docker
docker-compose restart
```

### Option 2: Manual File Upload

If not using Git, upload these modified files to your server:

- `user-service/src/index.js` (CORS + admin routes)
- `ai-service/src/index.js` (CORS)
- `chat-service/src/index.js` (CORS)
- `session-service/src/index.js` (CORS)
- `payment-service/src/index.js` (CORS)
- `feedback-service/src/index.js` (CORS)

Then restart all services on the server.

### Option 3: Rebuild and Redeploy with Docker

```bash
# On your local machine
cd MoodLiftBackend
docker-compose build
docker-compose push  # if using a registry

# On EC2 server
docker-compose pull
docker-compose down
docker-compose up -d
```

## Verify Deployment:

After deployment, test:

```bash
# Test CORS
curl -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://moodlift.site/user/api/v1/auth/login

# Should return 200 with Access-Control-Allow-Origin header

# Test login
curl -X POST https://moodlift.site/user/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@moodlift.com","password":"your-password"}'
```

## Current Status:

- ✅ Local backend: Updated and working
- ❌ Production backend: Needs deployment
- ✅ Frontend: Updated and can switch between local/production
