# 🚀 AI Service v2.0 - Production Ready

## ✅ Completed Features

### Core AI Capabilities

- ✅ **Intelligent Chat** with context awareness
- ✅ **Mood Analysis** with emotion detection
- ✅ **Coping Strategies** personalized recommendations
- ✅ **Journal Prompts** for self-reflection
- ✅ **Crisis Detection** for urgent situations

### Production Features

- ✅ **Conversation Memory** - Automatic context retention per user (30min cache)
- ✅ **Streaming Responses** - Real-time SSE for better UX
- ✅ **Retry Logic** - Automatic retry with exponential backoff (3 attempts)
- ✅ **Rate Limiting** - Environment-aware (dev: 100/min, prod: 20/min)
- ✅ **Request Tracking** - Unique IDs for debugging
- ✅ **Health Monitoring** - `/health` with metrics, `/ready` for readiness
- ✅ **Safety Settings** - Content filtering via Gemini
- ✅ **Memory Management** - Auto-cleanup + manual endpoints
- ✅ **Error Handling** - Comprehensive with request IDs
- ✅ **Logging** - Morgan with environment configs

## 📡 API Endpoints

### Chat & Memory

- `POST /api/v1/ai/chat` - Standard chat with memory
- `POST /api/v1/ai/chat/stream` - Streaming chat (SSE)
- `GET /api/v1/ai/memory/:userId` - Get conversation history
- `DELETE /api/v1/ai/memory/:userId` - Clear memory

### Analysis & Support

- `POST /api/v1/ai/analyze-mood` - Emotion detection
- `POST /api/v1/ai/coping-strategies` - Get personalized strategies
- `POST /api/v1/ai/journal-prompts` - Generate writing prompts
- `POST /api/v1/ai/crisis-detection` - Identify crisis situations

### Monitoring

- `GET /health` - Service health with metrics
- `GET /ready` - Readiness check (DB connectivity)

### Legacy (MongoDB)

- `GET /api/interactions/user/:userId` - User interactions
- `GET /api/interactions/:interactionId` - Specific interaction
- `POST /api/interactions/` - Create interaction
- `PUT /api/interactions/:interactionId` - Update interaction
- `DELETE /api/interactions/:interactionId` - Delete interaction

## 🔧 Configuration

### Environment Variables

```env
PORT=3005
MONGODB_URI=mongodb+srv://infosumitkumar3322_db_user:aAAwuVWdYLZhSuoX@cluster0.0bojjbt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=moodlift
GEMINI_API_KEY=AIzaSyB_LIvzrPM9f1AbHckCKp6R3Fp1cPyNsXc
NODE_ENV=production
FRONTEND_URL=https://your-frontend.com
```

### Rate Limits

**Development:**

- General API: 1000 req/15min
- AI Chat: 100 req/1min

**Production:**

- General API: 100 req/15min
- AI Chat: 20 req/1min

### Model Configuration

- **Model**: gemini-2.5-flash
- **Temperature**: 0.7 (creativity)
- **Top K**: 40 (diversity)
- **Top P**: 0.95 (nucleus sampling)
- **Max Tokens**: 1024

## 📊 Performance Metrics

- **Average Response**: 1-3 seconds
- **Memory Usage**: ~20MB (22MB total)
- **Uptime**: Service monitoring enabled
- **Cache TTL**: 30 minutes per user
- **Max History**: 20 messages (keeps last 10 for context)
- **Retry Delay**: 1s, 2s, 3s (exponential backoff)

## 🔒 Security Features

1. **Helmet.js** - Security headers
2. **CORS** - Whitelisted origins
3. **Rate Limiting** - Abuse prevention
4. **Content Safety** - Gemini filters
5. **Input Validation** - All endpoints
6. **Error Sanitization** - No leaks in production
7. **Request IDs** - Audit trail

## 🧪 Testing

Run comprehensive test suite:

```powershell
.\test-service.ps1
```

Tests:

1. ✅ Health check with metrics
2. ✅ Readiness (DB connection)
3. ✅ Chat with memory
4. ✅ Follow-up (memory persistence)
5. ✅ Get conversation history
6. ✅ Mood analysis
7. ✅ Coping strategies
8. ✅ Journal prompts
9. ✅ Crisis detection
10. ✅ Clear memory
11. ✅ Rate limiting

## 📦 Deployment Steps

### 1. Local Testing

```bash
cd ai-service
npm install
npm run dev
.\test-service.ps1  # Run tests
```

### 2. Deploy to Render

**Create Service:**

1. Go to Render.com Dashboard
2. New → Web Service
3. Connect GitHub: `Sumit6569/MoodLiftBackend`
4. Root Directory: `ai-service`

**Configuration:**

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment**: Node

**Environment Variables:**
Add these in Render dashboard:

```
PORT=3005
MONGODB_URI=mongodb+srv://infosumitkumar3322_db_user:aAAwuVWdYLZhSuoX@cluster0.0bojjbt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=moodlift
GEMINI_API_KEY=AIzaSyB_LIvzrPM9f1AbHckCKp6R3Fp1cPyNsXc
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Deploy Settings:**

- Auto-deploy: ✅ Enabled (main branch)
- Health Check Path: `/health`
- Pull Request Previews: Optional

### 3. Update Frontend

After deployment, get your Render URL (e.g., `https://ai-service-xyz.onrender.com`)

Update `mood-lift-support/src/lib/api-client.ts`:

```typescript
const AI_API_BASE_URL =
  import.meta.env.VITE_AI_API_BASE_URL || "https://ai-service-xyz.onrender.com";
```

Add to `.env`:

```
VITE_AI_API_BASE_URL=https://ai-service-xyz.onrender.com
```

### 4. Test Production

```powershell
# Health check
Invoke-RestMethod -Uri "https://ai-service-xyz.onrender.com/health"

# Test chat
$body = @{ userId = "prod-test"; message = "Hello" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://ai-service-xyz.onrender.com/api/v1/ai/chat" -Method Post -Body $body -ContentType "application/json"
```

## 🎯 Integration Guide

### Frontend Usage

```typescript
import { aiAPI } from "./api-client";

// Chat (automatically uses memory)
const response = await aiAPI.chat("user123", "I feel anxious");

// Analyze mood
const mood = await aiAPI.analyzeMood("I feel great today!");

// Get coping strategies
const strategies = await aiAPI.generateCopingStrategies("anxious", [
  "work",
  "sleep",
]);

// Generate journal prompts
const prompts = await aiAPI.generateJournalPrompts("reflective", ["gratitude"]);

// Detect crisis
const crisis = await aiAPI.detectCrisis(userMessage);
if (crisis.isCrisis) {
  // Show emergency resources
}

// Get conversation history
const history = await fetch(`${AI_API_BASE_URL}/api/v1/ai/memory/user123`);

// Clear conversation
await fetch(`${AI_API_BASE_URL}/api/v1/ai/memory/user123`, {
  method: "DELETE",
});
```

### Streaming Chat Example

```typescript
const response = await fetch("/api/v1/ai/chat/stream", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId, message }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split("\n\n");

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = JSON.parse(line.slice(6));
      if (data.text) {
        console.log(data.text); // Render incrementally
      }
      if (data.done) {
        console.log("Complete!", data.interactionId);
      }
    }
  }
}
```

## 📈 Monitoring

### Health Metrics

```json
{
  "status": "OK",
  "service": "ai-service",
  "version": "2.0.0",
  "timestamp": "2025-11-30T...",
  "uptime": 13.09,
  "memory": {
    "used": 20,
    "total": 22
  },
  "environment": "production"
}
```

### Readiness

```json
{
  "status": "ready"
}
```

Or on failure:

```json
{
  "status": "not ready",
  "reason": "database not connected"
}
```

## 🐛 Troubleshooting

### Issue: "API quota exceeded"

**Solution**: Wait 60 seconds or upgrade Gemini API plan at [Google AI Studio](https://ai.google.dev/)

### Issue: "Database not connected"

**Solution**:

1. Check MongoDB URI is correct
2. Verify IP whitelist on MongoDB Atlas
3. Check network connectivity

### Issue: "Too many requests"

**Solution**: Rate limit hit - either wait or adjust limits in code

### Issue: "Memory not persisting"

**Solution**:

1. Ensure `userId` is consistent across requests
2. Check if `useMemory: false` is being sent
3. Verify cache hasn't expired (30min TTL)

### Issue: "Service not responding"

**Solution**:

1. Check logs on Render
2. Verify environment variables set
3. Check `/health` endpoint
4. Review MongoDB connection

## 📚 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **AI**: Google Gemini 2.5 Flash
- **Database**: MongoDB Atlas
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Morgan
- **Compression**: gzip
- **Monitoring**: Built-in health checks

## 🎉 What's New in v2.0

1. **Conversation Memory** - Users get continuous context
2. **Streaming** - Real-time responses for better UX
3. **Retry Logic** - Handles API failures gracefully
4. **Advanced Monitoring** - Health metrics & readiness
5. **Memory Management** - API endpoints to view/clear history
6. **Request Tracking** - Unique IDs for debugging
7. **Safety Settings** - Content filtering enabled
8. **Better Rate Limiting** - Environment-aware configs
9. **Enhanced Logging** - Dev vs Production modes
10. **Comprehensive Docs** - README + Test Suite

## 📝 Next Steps

1. ✅ **Service Complete** - All features implemented
2. ⏭️ **Deploy to Render** - Follow deployment steps above
3. ⏭️ **Update Frontend** - Point to deployed URL
4. ⏭️ **Test Production** - Run health checks
5. ⏭️ **Monitor Usage** - Track API calls and errors
6. ⏭️ **Upgrade API Key** - If needed for higher quotas

## 🏆 Production Checklist

- ✅ Conversation memory with auto-cleanup
- ✅ Streaming responses (SSE)
- ✅ Retry logic (3 attempts, exponential backoff)
- ✅ Rate limiting (environment-aware)
- ✅ Request tracking (unique IDs)
- ✅ Health monitoring (metrics + readiness)
- ✅ Safety settings (content filtering)
- ✅ Error handling (comprehensive)
- ✅ Logging (Morgan, dev/prod modes)
- ✅ Security (Helmet, CORS, validation)
- ✅ Documentation (README, tests)
- ✅ Test suite (11 comprehensive tests)
- ✅ Git committed (v2.0 pushed)

## 🎯 Status: PRODUCTION READY ✅

The AI service is now fully prepared for production deployment with enterprise-grade features, monitoring, and security.

---

**Version**: 2.0.0  
**Last Updated**: November 30, 2025  
**Commit**: 8507a24  
**Status**: ✅ READY FOR DEPLOYMENT
