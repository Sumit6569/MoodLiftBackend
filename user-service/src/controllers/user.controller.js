import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { userRepo } from "../models/user.model.js";

export const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      age,
      gender,
      language_pref,
      is_listener,
      subscription_plan,
    } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const already = await userRepo.getUserByEmail(email);
    if (already)
      return res.status(409).json({ message: "Email already exists" });

    const password_hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const user = {
      user_id: uuidv4(),
      name,
      email,
      password_hash,
      age: typeof age === "number" ? age : undefined,
      gender: gender || undefined,
      language_pref: language_pref || undefined,
      is_listener: Boolean(is_listener) || false,
      subscription_plan: subscription_plan || "free",
      created_at: now,
      updated_at: now,
    };

    await userRepo.createUser(user);
    const { password_hash: _, ...safe } = user;
    return res.status(201).json(safe);
  } catch (err) {
    return next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId)
      return res.status(400).json({ message: "Missing userId parameter" });
    const user = await userRepo.getUserById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password_hash: _, ...safe } = user;
    return res.json(safe);
  } catch (err) {
    return next(err);
  }
};

export const getAllUsers = async (_req, res, next) => {
  try {
    const users = await userRepo.getAllUsers();
    return res.json(users.map(({ password_hash, ...u }) => u));
  } catch (err) {
    return next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    if (updates.password) {
      updates.password_hash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }
    const updated = await userRepo.updateUser(userId, updates);
    if (!updated) return res.status(404).json({ message: "User not found" });
    const { password_hash: _, ...safe } = updated;
    return res.json(safe);
  } catch (err) {
    return next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await userRepo.deleteUser(userId);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};
