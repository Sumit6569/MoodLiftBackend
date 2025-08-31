import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// MongoDB connection
const MONGODB_URI = "mongodb+srv://infosumitkumar3322_db_user:aAAwuVWdYLZhSuoX@cluster0.0bojjbt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
await mongoose.connect(MONGODB_URI, {
  dbName: "moodlift",
  retryWrites: true,
  w: "majority"
});

console.log("✅ Connected to MongoDB Atlas");

// Define schemas for seeding
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "listener"], required: true },
  freeSessionsUsed: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
}, { collection: "users" });

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  listenerId: { type: String, required: true },
  type: { type: String, enum: ["chat", "video"], required: true },
  status: { type: String, enum: ["pending", "active", "completed"], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String },
  cost: { type: Number, required: true },
}, { collection: "sessions" });

const chatMessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  messageId: { type: String, required: true, unique: true },
  senderId: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: String, required: true },
}, { collection: "chatMessages" });

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  sessionId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], required: true },
  createdAt: { type: String, required: true },
}, { collection: "payments" });

const aiInteractionSchema = new mongoose.Schema({
  interactionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  query: { type: String, required: true },
  response: { type: String, required: true },
  timestamp: { type: String, required: true },
}, { collection: "ai_interactions" });

const feedbackSchema = new mongoose.Schema({
  feedbackId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  sessionId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: String, required: true },
}, { collection: "feedback" });

// Create models
const User = mongoose.model("User", userSchema);
const Session = mongoose.model("Session", sessionSchema);
const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
const Payment = mongoose.model("Payment", paymentSchema);
const AIInteraction = mongoose.model("AIInteraction", aiInteractionSchema);
const Feedback = mongoose.model("Feedback", feedbackSchema);

// Sample data
const sampleUsers = [
  {
    userId: "user_001",
    name: "John Doe",
    email: "john.doe@example.com",
    passwordHash: await bcrypt.hash("password123", 10),
    role: "user",
    freeSessionsUsed: 2,
    createdAt: new Date("2024-01-15")
  },
  {
    userId: "user_002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    passwordHash: await bcrypt.hash("password123", 10),
    role: "user",
    freeSessionsUsed: 1,
    createdAt: new Date("2024-01-20")
  },
  {
    userId: "user_003",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    passwordHash: await bcrypt.hash("password123", 10),
    role: "user",
    freeSessionsUsed: 0,
    createdAt: new Date("2024-02-01")
  },
  {
    userId: "listener_001",
    name: "Dr. Sarah Wilson",
    email: "sarah.wilson@moodlift.com",
    passwordHash: await bcrypt.hash("password123", 10),
    role: "listener",
    freeSessionsUsed: 0,
    createdAt: new Date("2024-01-10")
  },
  {
    userId: "listener_002",
    name: "Dr. Robert Chen",
    email: "robert.chen@moodlift.com",
    passwordHash: await bcrypt.hash("password123", 10),
    role: "listener",
    freeSessionsUsed: 0,
    createdAt: new Date("2024-01-12")
  },
  {
    userId: "listener_003",
    name: "Dr. Emily Davis",
    email: "emily.davis@moodlift.com",
    passwordHash: await bcrypt.hash("password123", 10),
    role: "listener",
    freeSessionsUsed: 0,
    createdAt: new Date("2024-01-18")
  }
];

const sampleSessions = [
  {
    sessionId: "session_001",
    userId: "user_001",
    listenerId: "listener_001",
    type: "chat",
    status: "completed",
    startTime: "2024-02-15T10:00:00Z",
    endTime: "2024-02-15T11:00:00Z",
    cost: 50
  },
  {
    sessionId: "session_002",
    userId: "user_002",
    listenerId: "listener_002",
    type: "video",
    status: "completed",
    startTime: "2024-02-16T14:00:00Z",
    endTime: "2024-02-16T15:30:00Z",
    cost: 75
  },
  {
    sessionId: "session_003",
    userId: "user_001",
    listenerId: "listener_003",
    type: "chat",
    status: "active",
    startTime: "2024-02-17T09:00:00Z",
    endTime: null,
    cost: 50
  },
  {
    sessionId: "session_004",
    userId: "user_003",
    listenerId: "listener_001",
    type: "video",
    status: "pending",
    startTime: "2024-02-18T16:00:00Z",
    endTime: null,
    cost: 75
  }
];

const sampleChatMessages = [
  {
    sessionId: "session_001",
    messageId: "msg_001",
    senderId: "user_001",
    content: "Hi, I've been feeling really anxious lately. Can you help me?",
    timestamp: "2024-02-15T10:00:00Z"
  },
  {
    sessionId: "session_001",
    messageId: "msg_002",
    senderId: "listener_001",
    content: "Hello! I'm here to help. Can you tell me more about what's been causing your anxiety?",
    timestamp: "2024-02-15T10:01:00Z"
  },
  {
    sessionId: "session_001",
    messageId: "msg_003",
    senderId: "user_001",
    content: "I've been having trouble sleeping and my mind keeps racing with negative thoughts.",
    timestamp: "2024-02-15T10:02:00Z"
  },
  {
    sessionId: "session_002",
    messageId: "msg_004",
    senderId: "user_002",
    content: "I'm feeling overwhelmed with work and personal relationships.",
    timestamp: "2024-02-16T14:00:00Z"
  },
  {
    sessionId: "session_002",
    messageId: "msg_005",
    senderId: "listener_002",
    content: "That sounds challenging. Let's work through this together. What specific aspects are most difficult?",
    timestamp: "2024-02-16T14:01:00Z"
  }
];

const samplePayments = [
  {
    paymentId: "payment_001",
    userId: "user_001",
    sessionId: "session_001",
    amount: 50,
    status: "completed",
    createdAt: "2024-02-15T09:55:00Z"
  },
  {
    paymentId: "payment_002",
    userId: "user_002",
    sessionId: "session_002",
    amount: 75,
    status: "completed",
    createdAt: "2024-02-16T13:55:00Z"
  },
  {
    paymentId: "payment_003",
    userId: "user_001",
    sessionId: "session_003",
    amount: 50,
    status: "pending",
    createdAt: "2024-02-17T08:55:00Z"
  },
  {
    paymentId: "payment_004",
    userId: "user_003",
    sessionId: "session_004",
    amount: 75,
    status: "pending",
    createdAt: "2024-02-18T15:55:00Z"
  }
];

const sampleAIInteractions = [
  {
    interactionId: "ai_001",
    userId: "user_001",
    query: "How can I manage my anxiety?",
    response: "Here are some techniques to manage anxiety: 1. Deep breathing exercises 2. Progressive muscle relaxation 3. Mindfulness meditation 4. Regular exercise 5. Limiting caffeine and alcohol. Would you like me to explain any of these in detail?",
    timestamp: "2024-02-14T15:30:00Z"
  },
  {
    interactionId: "ai_002",
    userId: "user_002",
    query: "What are signs of depression?",
    response: "Common signs of depression include: persistent sadness, loss of interest in activities, changes in sleep or appetite, fatigue, difficulty concentrating, feelings of worthlessness, and thoughts of self-harm. If you're experiencing these symptoms, please consider speaking with a mental health professional.",
    timestamp: "2024-02-14T16:45:00Z"
  },
  {
    interactionId: "ai_003",
    userId: "user_003",
    query: "How to improve sleep quality?",
    response: "To improve sleep quality: 1. Maintain a consistent sleep schedule 2. Create a relaxing bedtime routine 3. Keep your bedroom cool and dark 4. Avoid screens before bed 5. Exercise regularly but not close to bedtime 6. Avoid large meals and caffeine before sleep.",
    timestamp: "2024-02-14T20:15:00Z"
  }
];

const sampleFeedback = [
  {
    feedbackId: "feedback_001",
    userId: "user_001",
    sessionId: "session_001",
    rating: 5,
    comment: "Dr. Wilson was very understanding and helped me feel much better. Highly recommend!",
    createdAt: "2024-02-15T11:30:00Z"
  },
  {
    feedbackId: "feedback_002",
    userId: "user_002",
    sessionId: "session_002",
    rating: 4,
    comment: "Great session with Dr. Chen. He provided practical advice for managing stress.",
    createdAt: "2024-02-16T15:45:00Z"
  },
  {
    feedbackId: "feedback_003",
    userId: "user_001",
    sessionId: "session_003",
    rating: 5,
    comment: "Dr. Davis is excellent at creating a safe space for open conversation.",
    createdAt: "2024-02-17T10:30:00Z"
  }
];

// Function to seed data
async function seedData() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    console.log("🗑️ Clearing existing data...");
    await User.deleteMany({});
    await Session.deleteMany({});
    await ChatMessage.deleteMany({});
    await Payment.deleteMany({});
    await AIInteraction.deleteMany({});
    await Feedback.deleteMany({});

    // Insert sample data
    console.log("👥 Inserting users...");
    await User.insertMany(sampleUsers);

    console.log("📅 Inserting sessions...");
    await Session.insertMany(sampleSessions);

    console.log("💬 Inserting chat messages...");
    await ChatMessage.insertMany(sampleChatMessages);

    console.log("💳 Inserting payments...");
    await Payment.insertMany(samplePayments);

    console.log("🤖 Inserting AI interactions...");
    await AIInteraction.insertMany(sampleAIInteractions);

    console.log("⭐ Inserting feedback...");
    await Feedback.insertMany(sampleFeedback);

    console.log("✅ Database seeding completed successfully!");
    console.log(`📊 Sample data created:`);
    console.log(`   - ${sampleUsers.length} users`);
    console.log(`   - ${sampleSessions.length} sessions`);
    console.log(`   - ${sampleChatMessages.length} chat messages`);
    console.log(`   - ${samplePayments.length} payments`);
    console.log(`   - ${sampleAIInteractions.length} AI interactions`);
    console.log(`   - ${sampleFeedback.length} feedback entries`);

  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run the seeding
seedData();

