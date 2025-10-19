import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "listener"], required: true },
    freeSessionsUsed: { type: Number, default: 0 },

    // Listener-specific fields
    bio: {
      type: String,
      required: function () {
        return this.role === "listener";
      },
    },
    expertise: [{ type: String }], // Array of expertise areas
    hourlyRate: {
      type: Number,
      min: 10,
      max: 200,
      required: function () {
        return this.role === "listener";
      },
    },
    isApproved: { type: Boolean, default: false }, // For listener approval process
    isVerified: { type: Boolean, default: false }, // For admin verification of listeners

    // Email verification removed - all users are automatically verified
    isEmailVerified: { type: Boolean, default: true },

    // Password reset
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },

    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() },
  },
  { collection: "users" }
);

userSchema.pre("save", function (next) {
  next();
});

export const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);

export const userRepo = {
  async getAllUsers() {
    return await UserModel.find()
      .select("-passwordHash -passwordResetToken")
      .lean();
  },
  async getUserByEmail(email) {
    return await UserModel.findOne({ email }).lean();
  },
  async createUser(user) {
    const doc = await UserModel.create(user);
    return doc.toObject();
  },
  async getUserById(userId) {
    return await UserModel.findOne({ userId })
      .select("-passwordHash -passwordResetToken")
      .lean();
  },
  async updateUser(userId, updates) {
    return await UserModel.findOneAndUpdate({ userId }, updates, {
      new: true,
      lean: true,
    });
  },
  async deleteUser(userId) {
    await UserModel.deleteOne({ userId });
  },
  // Email verification token function removed - no longer needed
  async getUserByPasswordResetToken(token) {
    return await UserModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).lean();
  },
  async getApprovedListeners() {
    return await UserModel.find({
      role: "listener",
      isApproved: true,
    })
      .select("-passwordHash -passwordResetToken")
      .lean();
  },
  async getPendingListeners() {
    return await UserModel.find({
      role: "listener",
      isApproved: false,
      isEmailVerified: true,
    })
      .select("-passwordHash -passwordResetToken")
      .lean();
  },
  async getAllListeners() {
    return await UserModel.find({
      role: "listener",
    })
      .select("-passwordHash -passwordResetToken")
      .lean();
  },
};
