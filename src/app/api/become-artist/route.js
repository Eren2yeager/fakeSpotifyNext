// pages/api/become-artist.js
import cloudinary from "@/lib/cloudinary";
import {connectDB} from "@/lib/mongoose";
import Artist from "@/models/Artist";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { uploadToCloudinary } from "@/lib/cloudinary";
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const formData = await req.formData();

  await connectDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }
  // Upload image to Cloudinary
  const name = formData.get("name");
  const image = formData.get("image");
  const bio = formData.get("bio");

  if (image && typeof image === "object") {
    const buffer = Buffer.from(await image.arrayBuffer());

    const secure_url = await uploadToCloudinary(buffer, "spotify/artists", "image")

    // // Create artist
    const artist = await Artist.create({
      user: user._id,
      name,
      bio,
      image: secure_url,
    });
  
    console.log(artist)
    user.artist = artist._id;
    user.isArtist = true;
    await user.save();
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
