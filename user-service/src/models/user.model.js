import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "listener"], required: true },
    freeSessionsUsed: { type: Number, default: 0 },
    createdAt: { type: Date, default: () => new Date() },
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
    return await UserModel.find().select("-passwordHash").lean();
  },
  async getUserByEmail(email) {
    return await UserModel.findOne({ email }).lean();
  },
  async createUser(user) {
    const doc = await UserModel.create(user);
    return doc.toObject();
  },
  async getUserById(userId) {
    return await UserModel.findOne({ userId }).lean();
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
};
