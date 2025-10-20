import { userRepo } from "../models/user.model.js";

// Get single listener by ID (public endpoint for session service)
export const getListenerById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await userRepo.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Listener not found",
      });
    }

    if (user.role !== "listener") {
      return res.status(400).json({
        success: false,
        message: "User is not a listener",
      });
    }

    res.json({
      success: true,
      listener: user,
    });
  } catch (error) {
    console.error("Get listener by ID error:", error);
    next(error);
  }
};

// Get all approved listeners (public endpoint)
export const getApprovedListeners = async (req, res, next) => {
  try {
    const listeners = await userRepo.getApprovedListeners();
    res.json({
      success: true,
      listeners,
    });
  } catch (error) {
    console.error("Get approved listeners error:", error);
    next(error);
  }
};

// Get pending listeners (admin only)
export const getPendingListeners = async (req, res, next) => {
  try {
    const listeners = await userRepo.getPendingListeners();
    res.json({
      success: true,
      listeners,
    });
  } catch (error) {
    console.error("Get pending listeners error:", error);
    next(error);
  }
};

// Approve listener (admin only)
export const approveListener = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await userRepo.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "listener") {
      return res.status(400).json({
        success: false,
        message: "User is not a listener",
      });
    }

    const updatedUser = await userRepo.updateUser(userId, {
      isApproved: true,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: "Listener approved successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Approve listener error:", error);
    next(error);
  }
};

// Reject listener (admin only)
export const rejectListener = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await userRepo.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "listener") {
      return res.status(400).json({
        success: false,
        message: "User is not a listener",
      });
    }

    // For now, just mark as not approved. In production, you might want to delete or mark as rejected
    const updatedUser = await userRepo.updateUser(userId, {
      isApproved: false,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: "Listener rejected",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Reject listener error:", error);
    next(error);
  }
};

// Update listener profile
export const updateListenerProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { name, bio, expertise, hourlyRate } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await userRepo.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "listener") {
      return res.status(400).json({
        success: false,
        message: "User is not a listener",
      });
    }

    // Validate updates
    const updates = { updatedAt: new Date() };

    if (name !== undefined) updates.name = name;

    if (bio !== undefined) updates.bio = bio;

    if (expertise !== undefined) {
      updates.expertise = Array.isArray(expertise)
        ? expertise
        : expertise.split(",").map((e) => e.trim());
    }

    if (hourlyRate !== undefined) {
      const rate = parseFloat(hourlyRate);
      if (rate < 10 || rate > 200) {
        return res.status(400).json({
          success: false,
          message: "Hourly rate must be between $10 and $200",
        });
      }
      updates.hourlyRate = rate;
    }

    const updatedUser = await userRepo.updateUser(userId, updates);

    res.json({
      success: true,
      message: "Listener profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update listener profile error:", error);
    next(error);
  }
};

// Get all listeners (admin only - both approved and pending)
export const getAllListeners = async (req, res, next) => {
  try {
    const listeners = await userRepo.getAllListeners();
    res.json({
      success: true,
      listeners,
    });
  } catch (error) {
    console.error("Get all listeners error:", error);
    next(error);
  }
};

// Verify listener (admin only - for isVerified field)
export const verifyListener = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (typeof isVerified !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isVerified must be a boolean value",
      });
    }

    const user = await userRepo.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "listener") {
      return res.status(400).json({
        success: false,
        message: "User is not a listener",
      });
    }

    const updatedUser = await userRepo.updateUser(userId, {
      isVerified,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: `Listener ${
        isVerified ? "verified" : "unverified"
      } successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Verify listener error:", error);
    next(error);
  }
};
