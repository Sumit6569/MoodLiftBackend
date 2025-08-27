import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password_hash: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    language_pref: { type: String },
    is_listener: { type: Boolean, default: false },
    subscription_plan: { type: String, default: "free" },
    created_at: { type: Date, default: () => new Date() },
    updated_at: { type: Date, default: () => new Date() },
  },
  { collection: "users" }
);

userSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

export const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema);

export const userRepo = {
  async getAllUsers() {
    return await UserModel.find().select("-password_hash").lean();
  },
  async getUserByEmail(email) {
    return await UserModel.findOne({ email }).lean();
  },
  async createUser(user) {
    const doc = await UserModel.create(user);
    return doc.toObject();
  },
  async getUserById(userId) {
    return await UserModel.findOne({ user_id: userId }).lean();
  },
  async updateUser(userId, updates) {
    updates.updated_at = new Date();
    return await UserModel.findOneAndUpdate({ user_id: userId }, updates, {
      new: true,
      lean: true,
    });
  },
  async deleteUser(userId) {
    await UserModel.deleteOne({ user_id: userId });
  },
};
