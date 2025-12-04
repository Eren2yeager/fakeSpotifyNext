import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads any file (image, audio, video, pdf, etc.) to Cloudinary.
 * Supports large files with chunked uploads for files over 20MB.
 *
 * @param {Buffer | string} fileBufferOrPath - File buffer or file path
 * @param {string} folder - Cloudinary folder name
 * @param {string} [resourceType="auto"] - Cloudinary resource type ("image", "video", "raw", "auto")
 * @returns {Promise<string>} Secure URL of uploaded file
 */
export const uploadToCloudinary = async (fileBufferOrPath, folder, resourceType = "auto") => {
  try {
    let uploaded;
    const uploadOptions = {
      folder,
      resource_type: resourceType,
      chunk_size: 6000000, // 6MB chunks for large files
    };

    if (Buffer.isBuffer(fileBufferOrPath)) {
      // Upload directly from buffer using upload_stream (no temp file needed)
      uploaded = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(fileBufferOrPath);
      });
    } else {
      // If it's already a file path
      uploaded = await cloudinary.uploader.upload(fileBufferOrPath, uploadOptions);
    }

    return uploaded.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error);
    throw new Error(error.message || "Cloudinary upload failed");
  }
};
