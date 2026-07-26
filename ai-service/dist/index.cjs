var $=Object.create;var w=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var D=Object.getOwnPropertyNames;var N=Object.getPrototypeOf,R=Object.prototype.hasOwnProperty;var G=(s,t,r,e)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of D(t))!R.call(s,o)&&o!==r&&w(s,o,{get:()=>t[o],enumerable:!(e=q(t,o))||e.enumerable});return s};var d=(s,t,r)=>(r=s!=null?$(N(s)):{},G(t||!s||!s.__esModule?w(r,"default",{value:s,enumerable:!0}):r,s));var f=d(require("express")),b=d(require("cors")),A=d(require("helmet")),P=d(require("compression")),E=d(require("morgan")),B=d(require("express-rate-limit")),T=d(require("dotenv"));var S=d(require("mongoose")),j=async()=>{try{let s=process.env.MONGODB_URI||"mongodb://mongo:27017/moodlift";await S.default.connect(s,{dbName:process.env.MONGODB_DB||"moodlift",retryWrites:!0,w:"majority"}),console.log("\u2705 Connected to MongoDB")}catch(s){console.error("\u274C MongoDB connection error:",s),process.exit(1)}};var M=require("express"),h=require("uuid");var y=d(require("mongoose")),x=new y.default.Schema({interactionId:{type:String,required:!0,unique:!0,index:!0},userId:{type:String,required:!0,index:!0},query:{type:String,required:!0},response:{type:String,required:!0},timestamp:{type:String,required:!0}},{collection:"ai_interactions",timestamps:!1});x.index({userId:1,timestamp:-1});var u=y.default.models.AIInteraction||y.default.model("AIInteraction",x),c={async createInteraction(s){return(await u.create(s)).toObject()},async getInteractionById(s){return await u.findOne({interactionId:s}).lean()},async getInteractionsByUserId(s){return await u.find({userId:s}).sort({timestamp:-1}).lean()},async updateInteraction(s,t){return await u.findOneAndUpdate({interactionId:s},t,{new:!0,lean:!0})},async deleteInteraction(s){await u.deleteOne({interactionId:s})},async deleteInteractionsByUserId(s){await u.deleteMany({userId:s})},async getAllInteractions(){return await u.find().sort({timestamp:-1}).lean()},async getInteractionsByDateRange(s,t){return await u.find({timestamp:{$gte:s,$lte:t}}).sort({timestamp:-1}).lean()}};var C=process.env.GEMINI_API_KEY||"AIzaSyDbu6qbwNyNfWmPiO2avj3hWg11a-GWcCc",_="https://generativelanguage.googleapis.com/v1/models",v="gemini-1.5-flash";async function l(s){let t=`${_}/${v}:generateContent?key=${C}`,r=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:s}]}]})});if(!r.ok){let o=await r.text();throw new Error(`Gemini API error: ${r.status} - ${o}`)}return(await r.json()).candidates[0].content.parts[0].text}var J=`You are MoodLift AI, a compassionate and empathetic mental health support assistant. Your role is to:

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

Remember: You're here to support, not to diagnose or treat mental health conditions.`,m={async chat(s,t=[]){try{let r=t.map(n=>`${n.role==="user"?"User":"Assistant"}: ${n.content}`).join(`
`),e=`${J}

Conversation History:
${r}

User: ${s}

Assistant:`;return{success:!0,response:await l(e),model:v}}catch(r){throw console.error("Gemini API error:",r),new Error(`Gemini API error: ${r.message}`)}},async analyzeMood(s){try{let t=`Analyze the emotional tone and mood of the following text. Provide:
1. Primary emotion (happy, sad, anxious, angry, neutral, etc.)
2. Intensity (1-10 scale)
3. Key indicators (words/phrases that indicate this emotion)
4. Brief supportive response

Text: "${s}"

Respond in JSON format:
{
  "emotion": "primary emotion",
  "intensity": number,
  "indicators": ["word1", "word2"],
  "supportiveResponse": "brief encouraging message"
}`,e=(await l(t)).match(/\{[\s\S]*\}/);return e?{success:!0,analysis:JSON.parse(e[0])}:{success:!1,error:"Failed to parse mood analysis"}}catch(t){throw console.error("Mood analysis error:",t),new Error(`Mood analysis error: ${t.message}`)}},async generateCopingStrategies(s,t){try{let r=`Based on the user's current mood (${s}) and concerns (${t.join(", ")}), generate 5 personalized coping strategies. 

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
}`,o=(await l(r)).match(/\{[\s\S]*\}/);return o?{success:!0,...JSON.parse(o[0])}:{success:!1,error:"Failed to generate strategies"}}catch(r){throw console.error("Strategy generation error:",r),new Error(`Strategy generation error: ${r.message}`)}},async generateJournalPrompts(s,t=[]){try{let r=`Generate 5 thoughtful journaling prompts for someone feeling ${s}. 
Preferences: ${t.join(", ")||"general well-being"}

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
}`,o=(await l(r)).match(/\{[\s\S]*\}/);return o?{success:!0,...JSON.parse(o[0])}:{success:!1,error:"Failed to generate prompts"}}catch(r){throw console.error("Prompt generation error:",r),new Error(`Prompt generation error: ${r.message}`)}},async detectCrisis(s){try{let t=`Analyze if the following text contains signs of a mental health crisis (suicide ideation, self-harm, immediate danger, severe distress).

Text: "${s}"

Respond in JSON format:
{
  "isCrisis": true/false,
  "severity": "low/medium/high/critical",
  "indicators": ["specific concerning phrases"],
  "recommendedAction": "what should be done",
  "resources": ["crisis hotline", "emergency services", etc.]
}`,e=(await l(t)).match(/\{[\s\S]*\}/);return e?{success:!0,...JSON.parse(e[0])}:{success:!1,error:"Failed to assess crisis"}}catch(t){throw console.error("Crisis detection error:",t),new Error(`Crisis detection error: ${t.message}`)}}};var a=(0,M.Router)();a.post("/chat",async(s,t,r)=>{try{let{userId:e,message:o,conversationHistory:n}=s.body;if(!e||!o)return t.status(400).json({success:!1,message:"Missing required fields: userId, message"});let p=await m.chat(o,n||[]),g={interactionId:(0,h.v4)(),userId:e,query:o,response:p.response,timestamp:new Date().toISOString()};await c.createInteraction(g),t.json({success:!0,response:p.response,model:p.model,interactionId:g.interactionId})}catch(e){console.error("Chat error:",e),t.status(500).json({success:!1,message:e.message||"Failed to generate response"})}});a.post("/analyze-mood",async(s,t,r)=>{try{let{userId:e,text:o}=s.body;if(!o)return t.status(400).json({success:!1,message:"Text is required"});let n=await m.analyzeMood(o);t.json(n)}catch(e){console.error("Mood analysis error:",e),t.status(500).json({success:!1,message:e.message||"Failed to analyze mood"})}});a.post("/coping-strategies",async(s,t,r)=>{try{let{mood:e,concerns:o}=s.body;if(!e)return t.status(400).json({success:!1,message:"Mood is required"});let n=await m.generateCopingStrategies(e,o||[]);t.json(n)}catch(e){console.error("Strategy generation error:",e),t.status(500).json({success:!1,message:e.message||"Failed to generate strategies"})}});a.post("/journal-prompts",async(s,t,r)=>{try{let{mood:e,preferences:o}=s.body;if(!e)return t.status(400).json({success:!1,message:"Mood is required"});let n=await m.generateJournalPrompts(e,o||[]);t.json(n)}catch(e){console.error("Prompt generation error:",e),t.status(500).json({success:!1,message:e.message||"Failed to generate prompts"})}});a.post("/crisis-detection",async(s,t,r)=>{try{let{text:e}=s.body;if(!e)return t.status(400).json({success:!1,message:"Text is required"});let o=await m.detectCrisis(e);t.json(o)}catch(e){console.error("Crisis detection error:",e),t.status(500).json({success:!1,message:e.message||"Failed to detect crisis"})}});a.post("/",async(s,t,r)=>{try{let{userId:e,query:o,response:n}=s.body;if(!e||!o||!n)return t.status(400).json({message:"Missing required fields"});let p={interactionId:(0,h.v4)(),userId:e,query:o,response:n,timestamp:new Date().toISOString()},g=await c.createInteraction(p);t.status(201).json(g)}catch(e){r(e)}});a.get("/:interactionId",async(s,t,r)=>{try{let{interactionId:e}=s.params,o=await c.getInteractionById(e);if(!o)return t.status(404).json({message:"Interaction not found"});t.json(o)}catch(e){r(e)}});a.get("/user/:userId",async(s,t,r)=>{try{let{userId:e}=s.params,o=await c.getInteractionsByUserId(e);t.json(o)}catch(e){r(e)}});a.get("/date-range/:startDate/:endDate",async(s,t,r)=>{try{let{startDate:e,endDate:o}=s.params,n=await c.getInteractionsByDateRange(e,o);t.json(n)}catch(e){r(e)}});a.get("/",async(s,t,r)=>{try{let e=await c.getAllInteractions();t.json(e)}catch(e){r(e)}});a.put("/:interactionId",async(s,t,r)=>{try{let{interactionId:e}=s.params,o=s.body;if(!o.query&&!o.response)return t.status(400).json({message:"At least one field must be provided for update"});let n=await c.updateInteraction(e,o);if(!n)return t.status(404).json({message:"Interaction not found"});t.json(n)}catch(e){r(e)}});a.delete("/:interactionId",async(s,t,r)=>{try{let{interactionId:e}=s.params;await c.deleteInteraction(e),t.status(204).send()}catch(e){r(e)}});a.delete("/user/:userId",async(s,t,r)=>{try{let{userId:e}=s.params;await c.deleteInteractionsByUserId(e),t.status(204).send()}catch(e){r(e)}});var I=a;T.default.config();var i=(0,f.default)(),O=process.env.PORT||3005;j();var U={origin:"*",optionsSuccessStatus:200,methods:["GET","POST","PUT","DELETE","PATCH","OPTIONS"],allowedHeaders:["Content-Type","Authorization"]};i.use((0,A.default)());i.use((0,P.default)());i.use((0,b.default)(U));i.use((0,E.default)("combined"));var z=(0,B.default)({windowMs:900*1e3,max:100,message:"Too many requests from this IP, please try again later."});i.use(z);i.use(f.default.json({limit:"10mb"}));i.use(f.default.urlencoded({extended:!0}));i.get("/health",(s,t)=>{t.json({status:"OK",service:"ai-service",timestamp:new Date().toISOString()})});i.use("/api/interactions",I);i.use("/api/v1/ai",I);i.use((s,t,r,e)=>{console.error(s.stack),r.status(s.status||500).json({success:!1,message:s.message||"Internal server error"})});process.on("SIGTERM",()=>{console.log("SIGTERM received, shutting down gracefully"),process.exit(0)});process.on("SIGINT",()=>{console.log("SIGINT received, shutting down gracefully"),process.exit(0)});i.listen(O,()=>{console.log(`AI service running on port ${O}`)});
