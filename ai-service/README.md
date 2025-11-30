# MoodLift AI Service 🤖

Production-ready AI microservice for mental health support powered by Google Gemini.

## 🚀 Features

### Core AI Capabilities
- **Intelligent Chat**: Context-aware conversations with mental health focus
- **Mood Analysis**: Emotion detection and sentiment analysis
- **Coping Strategies**: Personalized recommendations based on mood
- **Journal Prompts**: Thoughtful writing prompts for self-reflection
- **Crisis Detection**: Identifies urgent mental health situations

### Production Features
- ✅ **Conversation Memory**: Automatic context retention per user
- ✅ **Streaming Responses**: Real-time SSE for chat (better UX)
- ✅ **Retry Logic**: Automatic retry with exponential backoff
- ✅ **Rate Limiting**: Configurable per environment
- ✅ **Request Tracking**: Unique request IDs for debugging
- ✅ **Health Checks**: `/health` and `/ready` endpoints
- ✅ **Safety Settings**: Content filtering for user protection
- ✅ **Memory Management**: Auto-cleanup of old conversations
- ✅ **Error Handling**: Comprehensive error responses
- ✅ **Logging**: Morgan with environment-aware configs

## 📋 API Endpoints

### Chat Endpoints

#### POST `/api/v1/ai/chat`
Standard chat with conversation memory.

```json
{
  "userId": "user123",
  "message": "I'm feeling anxious today",
  "useMemory": true,
  "conversationHistory": []
}
```

Response:
```json
{
  "success": true,
  "response": "I understand you're feeling anxious...",
  "model": "gemini-2.5-flash",
  "interactionId": "uuid",
  "conversationId": "user123"
}
```

#### POST `/api/v1/ai/chat/stream`
Streaming chat for real-time responses (Server-Sent Events).

```javascript
const eventSource = new EventSource('/api/v1/ai/chat/stream', {
  method: 'POST',
  body: JSON.stringify({ userId, message })
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.done) {
    console.log('Complete!', data.interactionId);
  } else {
    console.log('Chunk:', data.text);
  }
};
```

### Memory Management

#### GET `/api/v1/ai/memory/:userId`
Get conversation history for a user.

```json
{
  "success": true,
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi there!" }
  ],
  "messageCount": 2
}
```

#### DELETE `/api/v1/ai/memory/:userId`
Clear conversation memory for a user.

```json
{
  "success": true,
  "message": "Conversation memory cleared"
}
```

### Analysis Endpoints

#### POST `/api/v1/ai/analyze-mood`
```json
{
  "text": "I feel overwhelmed and stressed"
}
```

Response:
```json
{
  "success": true,
  "analysis": {
    "emotion": "stressed",
    "intensity": 7,
    "indicators": ["overwhelmed", "stressed"],
    "supportiveResponse": "It sounds like you're going through..."
  }
}
```

#### POST `/api/v1/ai/coping-strategies`
```json
{
  "mood": "anxious",
  "concerns": ["work", "sleep"]
}
```

#### POST `/api/v1/ai/journal-prompts`
```json
{
  "mood": "reflective",
  "preferences": ["gratitude", "self-reflection"]
}
```

#### POST `/api/v1/ai/crisis-detection`
```json
{
  "text": "User message to analyze"
}
```

Response:
```json
{
  "success": true,
  "isCrisis": false,
  "severity": "low",
  "indicators": [],
  "recommendedAction": "Continue with normal support",
  "resources": []
}
```

### Legacy Endpoints

#### GET `/api/interactions/user/:userId`
Get all AI interactions for a user.

#### GET `/api/interactions/:interactionId`
Get specific interaction by ID.

## 🔧 Configuration

### Environment Variables

```env
PORT=3005
MONGODB_URI=mongodb+srv://...
MONGODB_DB=moodlift
GEMINI_API_KEY=your_api_key_here
NODE_ENV=production
FRONTEND_URL=https://your-frontend.com
```

### Rate Limits

**Development:**
- General: 1000 req/15min
- AI Chat: 100 req/min

**Production:**
- General: 100 req/15min
- AI Chat: 20 req/min

### Model Configuration

```javascript
temperature: 0.7,    // Creativity level
topK: 40,           // Diversity
topP: 0.95,         // Nucleus sampling
maxOutputTokens: 1024
```

## 🛠️ Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Configured origins only
- **Rate Limiting**: Prevent abuse
- **Content Filtering**: Gemini safety settings
- **Input Validation**: All endpoints validated
- **Error Sanitization**: No stack traces in production

## 📊 Monitoring

### Health Check
```bash
GET /health
```

Response includes:
- Service status
- Version
- Uptime
- Memory usage
- Environment

### Readiness Check
```bash
GET /ready
```

Checks database connectivity.

## 🚀 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3005
CMD ["npm", "start"]
```

### Render.com
1. Connect GitHub repository
2. Set root directory: `ai-service`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables

## 🧪 Testing

### Test Health Endpoint
```powershell
Invoke-RestMethod -Uri "http://localhost:3005/health"
```

### Test Chat
```powershell
$body = @{
  userId = "test123"
  message = "Hello"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3005/api/v1/ai/chat" `
  -Method Post -Body $body -ContentType "application/json"
```

### Test Mood Analysis
```powershell
$body = @{
  text = "I feel great today!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3005/api/v1/ai/analyze-mood" `
  -Method Post -Body $body -ContentType "application/json"
```

## 📝 Advanced Usage

### Using Conversation Memory

The service automatically maintains conversation context for each user:

```javascript
// First message
POST /api/v1/ai/chat
{ userId: "user123", message: "I'm feeling sad" }

// Follow-up (memory automatically used)
POST /api/v1/ai/chat
{ userId: "user123", message: "Why do I feel this way?" }
// AI remembers previous message about sadness
```

### Disable Memory for Single Request
```json
{
  "userId": "user123",
  "message": "...",
  "useMemory": false
}
```

### Manual History Management
```json
{
  "userId": "user123",
  "message": "...",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

## 🎯 Best Practices

1. **Always provide userId** for memory features
2. **Use streaming** for better UX on chat
3. **Clear memory** periodically (auto-cleanup after 30min)
4. **Monitor rate limits** in production
5. **Handle crisis detection** appropriately
6. **Log interactions** for analytics

## 📈 Performance

- **Average Response Time**: 1-3 seconds
- **Memory Footprint**: ~100MB
- **Concurrent Users**: 100+ (production)
- **Cache TTL**: 30 minutes
- **Max History**: 20 messages per user

## 🐛 Troubleshooting

### "API quota exceeded"
Wait 60 seconds or upgrade Gemini API plan.

### "Database not connected"
Check MongoDB URI and network connectivity.

### "Too many requests"
Rate limit hit - wait or adjust limits in config.

### "Memory not working"
Ensure `userId` is provided and consistent.

## 📚 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **AI**: Google Gemini 2.5 Flash
- **Database**: MongoDB Atlas
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan
- **Compression**: gzip

## 🤝 Integration

### Frontend Example
```typescript
import { aiAPI } from './api-client';

// Chat
const response = await aiAPI.chat('user123', 'Hello');

// Analyze mood
const mood = await aiAPI.analyzeMood('I feel great!');

// Get strategies
const strategies = await aiAPI.generateCopingStrategies('anxious', ['work']);

// Get prompts
const prompts = await aiAPI.generateJournalPrompts('reflective', ['gratitude']);

// Check crisis
const crisis = await aiAPI.detectCrisis(userMessage);

// Get history
const history = await aiAPI.getUserInteractions('user123');
```

## 📄 License

MIT

## 🙏 Credits

- Google Gemini AI
- MoodLift Team
- Mental Health Resources

---

**Version**: 2.0.0  
**Last Updated**: November 2025  
**Status**: Production Ready ✅
