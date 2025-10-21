import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { userRepo } from "../models/user.model.js";
import {
  uploadToCloudinary,
  deleteImage,
  extractPublicId,
} from "../config/cloudinary.js";

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

export const uploadProfilePicture = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Get user to check if they exist
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete old profile picture from Cloudinary if it exists
    if (user.profilePicture) {
      try {
        const publicId = extractPublicId(user.profilePicture);
        if (publicId) {
          await deleteImage(publicId);
          console.log("Old profile picture deleted:", publicId);
        }
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
        // Continue even if deletion fails
      }
    }

    // Upload new image to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      "moodlift/profiles"
    );

    // Update user with new profile picture URL
    const updatedUser = await userRepo.updateUser(userId, {
      profilePicture: result.secure_url,
      updatedAt: new Date(),
    });

    const { passwordHash: _, ...safeUser } = updatedUser;

    res.json({
      success: true,
      message: "Profile picture uploaded successfully",
      user: safeUser,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    next(error);
  }
};
