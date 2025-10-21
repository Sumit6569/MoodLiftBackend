/**
 * Cloudinary Configuration for Image Uploads
 */

import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to use memory storage
const storage = multer.memoryStorage();

// Create multer upload middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Helper function to upload image to Cloudinary
export const uploadToCloudinary = async (
  fileBuffer,
  folder = "moodlift/profiles"
) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        transformation: [
          { width: 500, height: 500, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else {
          console.log("Cloudinary upload success:", result.secure_url);
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// Helper function to delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted from Cloudinary:", result);
    return result;
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw error;
  }
};

// Helper function to extract public ID from Cloudinary URL
export const extractPublicId = (url) => {
  if (!url) return null;

  try {
    // URL format: https://res.cloudinary.com/[cloud_name]/image/upload/[version]/[folder]/[public_id].[format]
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    const publicId = filename.split(".")[0];
    const folder = parts[parts.length - 2];
    return `${folder}/${publicId}`;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};

export default cloudinary;
