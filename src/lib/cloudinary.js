"use server"
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;


export const uploadToCloudinary = async (fileBuffer, folder, resourceType = "image") => {
  const base64 = fileBuffer.toString("base64");
  const dataUri = "data:application/octet-stream;base64," + base64;

  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: resourceType,
  });

  return uploaded.secure_url;
};
