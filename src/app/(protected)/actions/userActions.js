// app/(protected)/actions/userActions.js
'use server';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from "next-auth";
import { Readable } from "stream";
import cloudinary from "@/lib/cloudinary";
import User from "@/models/User";

function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

export async function editUserProfile(formData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const username = formData.get("username");
  const image = formData.get("image");

  const updates = {};

  if (username) {
    updates.username = username.toString().trim();
  }

  if (image && typeof image === "object") {
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "user_profiles",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      bufferToStream(buffer).pipe(stream);
    });

    updates.image = result.secure_url;
  }

  await User.findByIdAndUpdate(session.user.id, updates);

  return true;
}
