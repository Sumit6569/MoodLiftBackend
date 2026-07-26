import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// MongoDB connection
const MONGODB_URI =
  "mongodb+srv://infosumitkumar3322_db_user:aAAwuVWdYLZhSuoX@cluster0.0bojjbt.mongodb.net/moodlift_user?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
await mongoose.connect(MONGODB_URI);
console.log("✅ Connected to moodlift_user database");

// User schema
const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "listener", "admin"], required: true },
    freeSessionsUsed: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    bio: { type: String },
    expertise: { type: String },
    hourlyRate: { type: Number },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "users" }
);

const User = mongoose.model("User", userSchema);

// Create admin user
async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@moodlift.com" });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("   Email: admin@moodlift.com");
      console.log("   Password: Admin@123");
    } else {
      const adminUser = {
        userId: "admin_001",
        name: "Admin User",
        email: "admin@moodlift.com",
        passwordHash: await bcrypt.hash("Admin@123", 10),
        role: "admin",
        freeSessionsUsed: 0,
        createdAt: new Date("2024-01-01"),
      };

      await User.create(adminUser);
      console.log("✅ Admin user created successfully!");
      console.log("\n📝 Login Credentials:");
      console.log("   Email: admin@moodlift.com");
      console.log("   Password: Admin@123");
    }
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

seedAdmin();
