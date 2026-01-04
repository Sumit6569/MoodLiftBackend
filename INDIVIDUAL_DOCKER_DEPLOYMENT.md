# MoodLift Backend - Individual Service Docker Deployment

This guide explains how to run each microservice independently using Docker.

## 🎯 Overview

Each microservice can be deployed and run separately using Docker. This is ideal for:

- **Independent scaling** of specific services
- **Cloud deployment** (AWS, Azure, GCP)
- **Testing** individual services
- **Microservices architecture** best practices

## 📋 Prerequisites

1. **Docker** installed ([Download Docker](https://www.docker.com/products/docker-desktop))
2. **MongoDB** instance (local or MongoDB Atlas)
3. Environment variables configured for each service

---

## 🚀 Quick Start - Deploy Individual Service

### Windows (PowerShell):

```powershell
cd user-service
.\run-docker.ps1
```

### Linux/Mac (Bash):

```bash
cd user-service
chmod +x run-docker.sh
./run-docker.sh
```

---

## 📦 All Services

| Service              | Port | Script (Windows)                  | Script (Linux/Mac)               |
| -------------------- | ---- | --------------------------------- | -------------------------------- |
| **User Service**     | 3001 | `user-service\run-docker.ps1`     | `user-service/run-docker.sh`     |
| **Session Service**  | 3002 | `session-service\run-docker.ps1`  | `session-service/run-docker.sh`  |
| **Chat Service**     | 3003 | `chat-service\run-docker.ps1`     | `chat-service/run-docker.sh`     |
| **Payment Service**  | 3004 | `payment-service\run-docker.ps1`  | `payment-service/run-docker.sh`  |
| **AI Service**       | 3005 | `ai-service\run-docker.ps1`       | `ai-service/run-docker.sh`       |
| **Feedback Service** | 3006 | `feedback-service\run-docker.ps1` | `feedback-service/run-docker.sh` |
| **Gateway**          | 3000 | `gateway\run-docker.ps1`          | `gateway/run-docker.sh`          |

---

## 🔧 Step-by-Step Deployment

### 1. Configure Environment Variables

Each service needs a `.env` file. First time running, the script will create one from `.env.example`:

```bash
cd user-service
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://localhost:27017/moodlift
JWT_SECRET=your-secret-key
SENDGRID_API_KEY=your-sendgrid-key
# ... etc
```

### 2. Build and Run Service

**Windows (PowerShell):**

```powershell
.\run-docker.ps1
```

**Linux/Mac (Bash):**

```bash
chmod +x run-docker.sh
./run-docker.sh
```

### 3. Verify Service is Running

```bash
# Check container status
docker ps

# Check logs
docker logs -f moodlift-user-service

# Test health endpoint
curl http://localhost:3001/api/health
```

---

## 🔄 Common Docker Commands

### View Running Containers

```bash
docker ps
```

### View All Containers (including stopped)

```bash
docker ps -a
```

### View Service Logs

```bash
docker logs -f moodlift-user-service
```

### Stop a Service

```bash
docker stop moodlift-user-service
```

### Restart a Service

```bash
docker restart moodlift-user-service
```

### Remove a Service

```bash
docker rm -f moodlift-user-service
```

### Rebuild Service (after code changes)

```bash
cd user-service
docker build -t moodlift-user-service .
docker stop moodlift-user-service
docker rm moodlift-user-service
./run-docker.ps1  # or ./run-docker.sh
```

---

## 🌐 Deploy All Services Together

### Option 1: Run Scripts for Each Service

**Windows PowerShell:**

```powershell
cd c:\Users\infos\Desktop\MoodLift\MoodLiftBackend

cd user-service; .\run-docker.ps1; cd ..
cd session-service; .\run-docker.ps1; cd ..
cd chat-service; .\run-docker.ps1; cd ..
cd payment-service; .\run-docker.ps1; cd ..
cd ai-service; .\run-docker.ps1; cd ..
cd feedback-service; .\run-docker.ps1; cd ..
cd gateway; .\run-docker.ps1; cd ..
```

### Option 2: Use Docker Compose (All Services at Once)

```bash
docker compose up -d --build
```

---

## ☁️ Cloud Deployment (AWS/Azure/GCP)

### AWS EC2 Deployment

1. **Launch EC2 Instance**

   - AMI: Ubuntu 22.04 or Amazon Linux 2
   - Instance Type: t3.medium or larger
   - Security Group: Open ports 3000-3006

2. **Install Docker on EC2**

```bash
sudo apt update
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu
```

3. **Upload Service Files**

```bash
scp -r user-service ubuntu@your-ec2-ip:/home/ubuntu/
```

4. **Run Service on EC2**

```bash
ssh ubuntu@your-ec2-ip
cd user-service
sudo ./run-docker.sh
```

### Docker Hub Deployment

1. **Build and Tag Image**

```bash
docker build -t yourusername/moodlift-user-service:latest .
```

2. **Push to Docker Hub**

```bash
docker login
docker push yourusername/moodlift-user-service:latest
```

3. **Pull and Run on Server**

```bash
docker pull yourusername/moodlift-user-service:latest
docker run -d --name moodlift-user-service --env-file .env -p 3001:3001 yourusername/moodlift-user-service:latest
```

---

## 🔐 Production Best Practices

### 1. Use MongoDB Atlas (Cloud Database)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moodlift
```

### 2. Secure Environment Variables

- Never commit `.env` files to Git
- Use AWS Secrets Manager or Azure Key Vault
- Rotate secrets regularly

### 3. Enable HTTPS

- Use reverse proxy (Nginx/Traefik)
- Configure SSL certificates (Let's Encrypt)

### 4. Monitor Services

```bash
# View resource usage
docker stats

# Set up health checks
curl http://localhost:3001/api/health
```

### 5. Persistent Logs

```bash
docker run -d \
  --name moodlift-user-service \
  --env-file .env \
  -p 3001:3001 \
  -v /var/log/moodlift:/app/logs \
  moodlift-user-service
```

---

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker logs moodlift-user-service

# Common issues:
# - MongoDB connection failed → Check MONGODB_URI
# - Port already in use → Change PORT in .env
# - Missing environment variables → Check .env file
```

### Container Keeps Restarting

```bash
# View recent logs
docker logs --tail 100 moodlift-user-service

# Check container health
docker inspect moodlift-user-service | grep -A 10 Health
```

### Cannot Connect to Service

```bash
# Check if port is exposed
docker port moodlift-user-service

# Check firewall rules
sudo ufw status
sudo ufw allow 3001/tcp
```

### Out of Disk Space

```bash
# Clean up unused images
docker system prune -a

# Remove unused volumes
docker volume prune
```

---

## 📊 Service Dependencies

Each service requires:

- ✅ MongoDB connection
- ✅ Environment variables
- ✅ Network access to dependencies

### Service Dependency Map:

- **Gateway** → Requires all other services
- **User Service** → Independent (only needs MongoDB)
- **Session Service** → Depends on User Service
- **Chat Service** → Depends on User Service
- **Payment Service** → Independent
- **AI Service** → Independent
- **Feedback Service** → Depends on User Service

---

## 📞 Support

For issues or questions:

1. Check service logs: `docker logs -f <container-name>`
2. Verify environment variables in `.env`
3. Ensure MongoDB is accessible
4. Check Docker installation: `docker --version`

---

## 🎉 Success!

Your services should now be running individually with Docker!

Check status: `docker ps`

Happy deploying! 🚀
