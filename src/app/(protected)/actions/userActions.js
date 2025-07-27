"use server";

import cloudinary from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import User from "@/models/User";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function editUserProfile(formData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return false;

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) return false;

    const name = formData.get("name");
    const image = formData.get("image");

    if (name) user.name = name;

    if (image && typeof image === "object") {
      const buffer = await image.arrayBuffer();
      const bytes = Buffer.from(buffer);

      const uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "spotify/users",
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(bytes);
      });

      user.image = uploaded.secure_url;
    }

    await user.save();
    
    session.user.name = user.name
    session.user.image = user.image

    revalidatePath("/profile");
    return true;
  } catch (err) {
    console.error("Failed to update profile:", err);
    return false;
  }
}
