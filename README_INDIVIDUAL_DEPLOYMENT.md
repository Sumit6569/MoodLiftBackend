# 🚀 MoodLift Microservices - Individual Docker Deployment

## ✅ What's Been Set Up

All 7 microservices are now ready for **individual Docker deployment**:

### ✅ Completed Setup:

- [x] **Dockerfiles** for all 7 services (multi-stage builds)
- [x] **.dockerignore** files for optimized builds
- [x] **.env.example** templates with required variables
- [x] **run-docker.ps1** scripts (Windows PowerShell)
- [x] **run-docker.sh** scripts (Linux/Mac Bash)
- [x] Complete deployment documentation

---

## 📦 Services Ready for Deployment

| #   | Service              | Port | Status   | Docker Script                      |
| --- | -------------------- | ---- | -------- | ---------------------------------- |
| 1   | **User Service**     | 3001 | ✅ Ready | `run-docker.ps1` / `run-docker.sh` |
| 2   | **Session Service**  | 3002 | ✅ Ready | `run-docker.ps1` / `run-docker.sh` |
| 3   | **Chat Service**     | 3003 | ✅ Ready | `run-docker.ps1` / `run-docker.sh` |
| 4   | **Payment Service**  | 3004 | ✅ Ready | `run-docker.ps1` / `run-docker.sh` |
| 5   | **AI Service**       | 3005 | ✅ Ready | `run-docker.ps1` / `run-docker.sh` |
| 6   | **Feedback Service** | 3006 | ✅ Ready | `run-docker.ps1` / `run-docker.sh` |
| 7   | **Gateway**          | 3000 | ✅ Ready | `run-docker.ps1` / `run-docker.sh` |

---

## 🎯 Quick Start - Deploy a Service

### 1️⃣ Start Docker Desktop

Make sure Docker Desktop is running on your Windows machine.

### 2️⃣ Navigate to Service Directory

```powershell
cd c:\Users\infos\Desktop\MoodLift\MoodLiftBackend\user-service
```

### 3️⃣ Configure Environment (First Time Only)

```powershell
# Copy example to .env
Copy-Item .env.example .env

# Edit .env with your settings
notepad .env
```

### 4️⃣ Run the Service

```powershell
.\run-docker.ps1
```

**That's it!** The script will:

- ✅ Build the Docker image
- ✅ Stop any existing container
- ✅ Start the new container
- ✅ Show you the service URL and status

---

## 🔄 Deploy All Services (One by One)

Open PowerShell and run:

```powershell
cd c:\Users\infos\Desktop\MoodLift\MoodLiftBackend

# Deploy User Service
cd user-service; .\run-docker.ps1; cd ..

# Deploy Session Service
cd session-service; .\run-docker.ps1; cd ..

# Deploy Chat Service
cd chat-service; .\run-docker.ps1; cd ..

# Deploy Payment Service
cd payment-service; .\run-docker.ps1; cd ..

# Deploy AI Service
cd ai-service; .\run-docker.ps1; cd ..

# Deploy Feedback Service
cd feedback-service; .\run-docker.ps1; cd ..

# Deploy Gateway
cd gateway; .\run-docker.ps1; cd ..
```

---

## 📋 Environment Variables Required

### User Service (.env)

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/moodlift
JWT_SECRET=your-secret-key
SENDGRID_API_KEY=your-sendgrid-api-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=http://localhost:5173
```

### Session Service (.env)

```env
NODE_ENV=production
PORT=3002
MONGODB_URI=mongodb://localhost:27017/moodlift
SENDGRID_API_KEY=your-sendgrid-api-key
USER_SERVICE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
```

### Chat Service (.env)

```env
NODE_ENV=production
PORT=3003
MONGODB_URI=mongodb://localhost:27017/moodlift
USER_SERVICE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
```

### Payment Service (.env)

```env
NODE_ENV=production
PORT=3004
MONGODB_URI=mongodb://localhost:27017/moodlift
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox
FRONTEND_URL=http://localhost:5173
```

### AI Service (.env)

```env
NODE_ENV=production
PORT=3005
MONGODB_URI=mongodb://localhost:27017/moodlift
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=http://localhost:5173
```

### Feedback Service (.env)

```env
NODE_ENV=production
PORT=3006
MONGODB_URI=mongodb://localhost:27017/moodlift
USER_SERVICE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173
```

### Gateway (.env)

```env
NODE_ENV=production
PORT=3000
USER_SERVICE_URL=http://localhost:3001
SESSION_SERVICE_URL=http://localhost:3002
CHAT_SERVICE_URL=http://localhost:3003
PAYMENT_SERVICE_URL=http://localhost:3004
AI_SERVICE_URL=http://localhost:3005
FEEDBACK_SERVICE_URL=http://localhost:3006
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

---

## 🐳 Docker Commands Reference

### Check Running Services

```powershell
docker ps
```

### View Service Logs

```powershell
docker logs -f moodlift-user-service
```

### Stop a Service

```powershell
docker stop moodlift-user-service
```

### Restart a Service

```powershell
docker restart moodlift-user-service
```

### Remove a Service

```powershell
docker rm -f moodlift-user-service
```

### Stop All Services

```powershell
docker stop moodlift-user-service moodlift-session-service moodlift-chat-service moodlift-payment-service moodlift-ai-service moodlift-feedback-service moodlift-gateway
```

### Remove All Services

```powershell
docker rm -f moodlift-user-service moodlift-session-service moodlift-chat-service moodlift-payment-service moodlift-ai-service moodlift-feedback-service moodlift-gateway
```

---

## ✅ Verify Services Are Running

After deploying, verify each service:

```powershell
# User Service
curl http://localhost:3001/api/health

# Session Service
curl http://localhost:3002/health

# Chat Service
curl http://localhost:3003/health

# Payment Service
curl http://localhost:3004/health

# AI Service
curl http://localhost:3005/health

# Feedback Service
curl http://localhost:3006/health

# Gateway
curl http://localhost:3000/health
```

Or open in browser:

- Gateway: http://localhost:3000
- User Service: http://localhost:3001
- Session Service: http://localhost:3002
- Chat Service: http://localhost:3003
- Payment Service: http://localhost:3004
- AI Service: http://localhost:3005
- Feedback Service: http://localhost:3006

---

## ☁️ Deploy to Cloud (AWS, Azure, GCP)

Each service can be deployed to cloud platforms independently:

### AWS EC2

1. Launch EC2 instance (Ubuntu 22.04)
2. Install Docker
3. Upload service folder
4. Run deployment script

### Azure Container Instances

```bash
az container create --resource-group myResourceGroup --name moodlift-user --image moodlift-user-service --dns-name-label moodlift-user --ports 3001
```

### Google Cloud Run

```bash
gcloud run deploy moodlift-user-service --image gcr.io/project-id/moodlift-user-service --platform managed
```

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Docker Desktop is running
- [ ] All services have `.env` files configured
- [ ] MongoDB is running (local or Atlas)
- [ ] Services are running: `docker ps`
- [ ] Health checks pass for all services
- [ ] Gateway can reach all microservices
- [ ] Frontend can connect to Gateway

---

## 📚 Documentation Files

- **INDIVIDUAL_DOCKER_DEPLOYMENT.md** - Comprehensive deployment guide
- **DOCKER_DEPLOYMENT_GUIDE.md** - Original Docker guide
- **DOCKER_QUICK_START.md** - Quick reference
- **docker-compose.yml** - Deploy all services together

---

## 🆘 Troubleshooting

### Docker Desktop Not Running

**Error:** `cannot connect to docker daemon`
**Solution:** Start Docker Desktop application

### Port Already in Use

**Error:** `port is already allocated`
**Solution:**

```powershell
# Stop existing container
docker stop moodlift-user-service
# Or change port in .env file
```

### MongoDB Connection Failed

**Error:** `MongooseError: connect ECONNREFUSED`
**Solution:**

- Start MongoDB locally, or
- Use MongoDB Atlas cloud database
- Update `MONGODB_URI` in .env

### Missing Environment Variables

**Error:** `undefined is not valid`
**Solution:** Check `.env` file has all required variables from `.env.example`

---

## 🎯 Next Steps

1. ✅ Start Docker Desktop
2. ✅ Configure MongoDB (local or Atlas)
3. ✅ Set up `.env` files for each service
4. ✅ Deploy services using `run-docker.ps1`
5. ✅ Verify all services are running
6. ✅ Test API endpoints

---

**🚀 You're all set for independent microservice deployment!**

For detailed deployment instructions, see [INDIVIDUAL_DOCKER_DEPLOYMENT.md](./INDIVIDUAL_DOCKER_DEPLOYMENT.md)
