import { NextResponse } from "next/server";
import { revalidatePath } from 'next/cache';
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import cloudinary from "@/lib/cloudinary";
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const type = formData.get("type");

  // to get the user
  if (type === "getUser") {
    const userId = formData.get("userId");

    await connectDB();
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  }

  // for edit profile
  if (type === "editProfile") {
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const name = formData.get("name");
    const image = formData.get("image");

    if (name) user.name = name;

    if (image && typeof image === "object") {
      const buffer = Buffer.from(await image.arrayBuffer());

      const uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "spotify/users",
              resource_type: "image",
            },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      user.image = uploaded.secure_url;
    }

    await user.save();
    revalidatePath("/profile")
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
