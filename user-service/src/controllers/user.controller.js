import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { userRepo } from "../models/user.model.js";

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, freeSessionsUsed } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!["user", "listener"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Role must be 'user' or 'listener'" });
    }

    const already = await userRepo.getUserByEmail(email);
    if (already)
      return res.status(409).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const user = {
      userId: uuidv4(),
      name,
      email,
      passwordHash,
      role,
      freeSessionsUsed: freeSessionsUsed || 0,
      createdAt: now,
    };

    await userRepo.createUser(user);
    const { passwordHash: _, ...safe } = user;
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
    const { passwordHash: _, ...safe } = user;
    return res.json(safe);
  } catch (err) {
    return next(err);
  }
};

export const getAllUsers = async (_req, res, next) => {
  try {
    const users = await userRepo.getAllUsers();
    return res.json(users);
  } catch (err) {
    return next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updates = { ...req.body };
    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }
    const updated = await userRepo.updateUser(userId, updates);
    if (!updated) return res.status(404).json({ message: "User not found" });
    const { passwordHash: _, ...safe } = updated;
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
