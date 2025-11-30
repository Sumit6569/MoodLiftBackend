import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyB_LIvzrPM9f1AbHckCKp6R3Fp1cPyNsXc";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Conversation memory cache (in production, use Redis)
const conversationCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Model configuration
const MODEL_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024,
};

// Safety settings
const SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
];

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to retry API calls
async function retryWithBackoff(fn, retries = MAX_RETRIES) {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && (error.status === 429 || error.status === 503)) {
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1))
      );
      return retryWithBackoff(fn, retries - 1);
    }
    throw error;
  }
}

// Get or create conversation memory
function getConversationMemory(userId) {
  if (!conversationCache.has(userId)) {
    conversationCache.set(userId, {
      history: [],
      lastAccess: Date.now(),
    });
  }
  const memory = conversationCache.get(userId);
  memory.lastAccess = Date.now();
  return memory;
}

// Clean up old conversations
setInterval(() => {
  const now = Date.now();
  for (const [userId, memory] of conversationCache.entries()) {
    if (now - memory.lastAccess > CACHE_TTL) {
      conversationCache.delete(userId);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

// System prompt for mental health support
const SYSTEM_PROMPT = `You are MoodLift AI, a compassionate and empathetic mental health support assistant. Your role is to:

1. Provide emotional support and encouragement
2. Listen actively and validate feelings
3. Offer coping strategies and mindfulness techniques
4. Suggest healthy habits for mental well-being
5. Recognize crisis situations and recommend professional help when needed

Guidelines:
- Be warm, understanding, and non-judgmental
- Keep responses concise but meaningful (2-4 paragraphs)
- Ask follow-up questions to understand better
- Never diagnose or replace professional therapy
- In crisis situations, immediately recommend professional help or crisis hotlines
- Use positive, hopeful language while acknowledging difficulties
- Provide actionable advice when appropriate

Remember: You're here to support, not to diagnose or treat mental health conditions.`;

export const geminiService = {
  // Chat with Gemini AI (with memory and retry)
  async chat(userMessage, conversationHistory = [], userId = null) {
    return retryWithBackoff(async () => {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: MODEL_CONFIG,
          safetySettings: SAFETY_SETTINGS,
        });

        // Use conversation memory if userId provided
        let history = conversationHistory;
        if (userId) {
          const memory = getConversationMemory(userId);
          history =
            memory.history.length > 0 ? memory.history : conversationHistory;
        }

        // Build conversation context (limit to last 10 messages)
        const recentHistory = history.slice(-10);
        const context = recentHistory
          .map(
            (msg) =>
              `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
          )
          .join("\n");

        const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation History:\n${context}\n\nUser: ${userMessage}\n\nAssistant:`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        // Update conversation memory
        if (userId) {
          const memory = getConversationMemory(userId);
          memory.history.push(
            { role: "user", content: userMessage },
            { role: "assistant", content: text }
          );
          // Keep only last 20 messages
          if (memory.history.length > 20) {
            memory.history = memory.history.slice(-20);
          }
        }

        return {
          success: true,
          response: text,
          model: "gemini-2.5-flash",
          conversationId: userId,
        };
      } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error(`Gemini API error: ${error.message}`);
      }
    });
  },

  // Stream chat response (for real-time UI)
  async chatStream(userMessage, conversationHistory = [], userId = null) {
    return retryWithBackoff(async () => {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: MODEL_CONFIG,
          safetySettings: SAFETY_SETTINGS,
        });

        let history = conversationHistory;
        if (userId) {
          const memory = getConversationMemory(userId);
          history =
            memory.history.length > 0 ? memory.history : conversationHistory;
        }

        const recentHistory = history.slice(-10);
        const context = recentHistory
          .map(
            (msg) =>
              `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
          )
          .join("\n");

        const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation History:\n${context}\n\nUser: ${userMessage}\n\nAssistant:`;

        const result = await model.generateContentStream(fullPrompt);
        return result.stream;
      } catch (error) {
        console.error("Gemini streaming error:", error);
        throw new Error(`Gemini streaming error: ${error.message}`);
      }
    });
  },

  // Clear conversation memory
  clearMemory(userId) {
    conversationCache.delete(userId);
    return { success: true, message: "Conversation memory cleared" };
  },

  // Get conversation history
  getMemory(userId) {
    if (!conversationCache.has(userId)) {
      return { success: false, message: "No conversation history found" };
    }
    const memory = conversationCache.get(userId);
    return {
      success: true,
      history: memory.history,
      messageCount: memory.history.length,
    };
  },

  // Analyze mood from text (with retry)
  async analyzeMood(text) {
    return retryWithBackoff(async () => {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: { ...MODEL_CONFIG, temperature: 0.3 },
        });

const prompt = `Analyze the emotional tone and mood of the following text. Provide:
1. Primary emotion (happy, sad, anxious, angry, neutral, etc.)
2. Intensity (1-10 scale)
3. Key indicators (words/phrases that indicate this emotion)
4. Brief supportive response

Text: "${text}"

Respond in JSON format:
{
  "emotion": "primary emotion",
  "intensity": number,
  "indicators": ["word1", "word2"],
  "supportiveResponse": "brief encouraging message"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text_response = response.text();

        // Extract JSON from response
        const jsonMatch = text_response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            analysis,
          };
        }

        return {
          success: false,
          error: "Failed to parse mood analysis",
        };
      } catch (error) {
        console.error("Mood analysis error:", error);
        throw new Error(`Mood analysis error: ${error.message}`);
      }
    });
  },

  // Generate personalized coping strategies (with retry)
  async generateCopingStrategies(mood, concerns) {
    return retryWithBackoff(async () => {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: MODEL_CONFIG,
        });

        const prompt = `Based on the user's current mood (${mood}) and concerns (${concerns.join(
          ", "
        )}), generate 5 personalized coping strategies. 

Each strategy should be:
- Actionable and specific
- Appropriate for the mood/concerns
- Evidence-based when possible
- Easy to implement

Respond in JSON format:
{
  "strategies": [
    {
      "title": "Strategy name",
      "description": "How to do it",
      "duration": "Time needed",
      "difficulty": "easy/medium/hard"
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const strategies = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            ...strategies,
          };
        }

        return {
          success: false,
          error: "Failed to generate strategies",
        };
      } catch (error) {
        console.error("Strategy generation error:", error);
        throw new Error(`Strategy generation error: ${error.message}`);
      }
    });
  },

  // Generate journal prompts (with retry)
  async generateJournalPrompts(mood, preferences = []) {
    return retryWithBackoff(async () => {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: MODEL_CONFIG,
        });

        const prompt = `Generate 5 thoughtful journaling prompts for someone feeling ${mood}. 
Preferences: ${preferences.join(", ") || "general well-being"}

Each prompt should:
- Encourage self-reflection
- Be open-ended
- Be supportive and non-judgmental
- Help process emotions

Respond in JSON format:
{
  "prompts": [
    {
      "prompt": "The journaling question",
      "purpose": "What this helps with"
    }
  ]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const prompts = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            ...prompts,
          };
        }

        return {
          success: false,
          error: "Failed to generate prompts",
        };
      } catch (error) {
        console.error("Prompt generation error:", error);
        throw new Error(`Prompt generation error: ${error.message}`);
      }
    });
  },

  // Crisis detection (with retry and high priority)
  async detectCrisis(text) {
    return retryWithBackoff(async () => {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: { ...MODEL_CONFIG, temperature: 0.2 },
        });

        const prompt = `Analyze if the following text contains signs of a mental health crisis (suicide ideation, self-harm, immediate danger, severe distress).

Text: "${text}"

Respond in JSON format:
{
  "isCrisis": true/false,
  "severity": "low/medium/high/critical",
  "indicators": ["specific concerning phrases"],
  "recommendedAction": "what should be done",
  "resources": ["crisis hotline", "emergency services", etc.]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text_response = response.text();

        const jsonMatch = text_response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const crisis = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            ...crisis,
          };
        }

        return {
          success: false,
          error: "Failed to assess crisis",
        };
      } catch (error) {
        console.error("Crisis detection error:", error);
        throw new Error(`Crisis detection error: ${error.message}`);
      }
    });
  },
};
