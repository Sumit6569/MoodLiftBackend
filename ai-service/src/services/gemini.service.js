import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyB_LIvzrPM9f1AbHckCKp6R3Fp1cPyNsXc";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

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
  // Chat with Gemini AI
  async chat(userMessage, conversationHistory = []) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Build conversation context
      const context = conversationHistory
        .map(
          (msg) =>
            `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
        )
        .join("\n");

      const fullPrompt = `${SYSTEM_PROMPT}\n\nConversation History:\n${context}\n\nUser: ${userMessage}\n\nAssistant:`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        response: text,
        model: "gemini-2.5-flash",
      };
    } catch (error) {
      console.error("Gemini API error:", error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  },

  // Analyze mood from text
  async analyzeMood(text) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
  },

  // Generate personalized coping strategies
  async generateCopingStrategies(mood, concerns) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
  },

  // Generate journal prompts
  async generateJournalPrompts(mood, preferences = []) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
  },

  // Crisis detection
  async detectCrisis(text) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
  },
};
