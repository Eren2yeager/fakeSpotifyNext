import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads any file (image, audio, video, pdf, etc.) to Cloudinary.
 * Works for very large files — no 5 MB limit.
 *
 * @param {Buffer | string} fileBufferOrPath - File buffer or file path
 * @param {string} folder - Cloudinary folder name
 * @param {string} [resourceType="auto"] - Cloudinary resource type ("image", "video", "raw", "auto")
 * @returns {Promise<string>} Secure URL of uploaded file
 */
export const uploadToCloudinary = async (fileBufferOrPath, folder, resourceType = "auto") => {
  try {
    let uploaded;

    if (Buffer.isBuffer(fileBufferOrPath)) {
      // If it's a Buffer, write it to a temporary file
      const tempFilePath = `./temp_${Date.now()}`;
      fs.writeFileSync(tempFilePath, fileBufferOrPath);

      uploaded = await cloudinary.uploader.upload(tempFilePath, {
        folder,
        resource_type: resourceType,
      });

      // Clean up temp file after upload
      fs.unlinkSync(tempFilePath);
    } else {
      // If it's already a file path
      uploaded = await cloudinary.uploader.upload(fileBufferOrPath, {
        folder,
        resource_type: resourceType,
      });
    }

    return uploaded.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error);
    throw new Error("Cloudinary upload failed");
  }
};
