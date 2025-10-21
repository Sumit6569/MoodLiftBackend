import { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadProfilePicture,
} from "../controllers/user.controller.js";
import { upload } from "../config/cloudinary.js";

const router = Router();

// Temporarily remove auth middleware
router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.post("/", createUser);
router.patch("/:userId", updateUser);
router.delete("/:userId", deleteUser);

// Profile picture upload
router.post(
  "/:userId/profile-picture",
  upload.single("profilePicture"),
  uploadProfilePicture
);

export default router;
