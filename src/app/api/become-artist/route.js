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
    session.user.isArtist = true;
    await user.save();
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}


// This handler matches the request from @file_context_0 (EditArtistDetailsPopup)
// The client sends a FormData with type, id, name, bio, and maybe image.
// The handler below checks authentication, finds the user, and updates the artist.

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const formData = await req.formData();

  await connectDB();

  // The client sends the artist id as "id" in the formData
  const artistId = formData.get("id");
  if (!artistId) {
    return new Response(JSON.stringify({ error: "Artist ID is required" }), {
      status: 400,
    });
  }

  // Find the user and ensure they are the artist owner
  const user = await User.findOne({ email: session.user.email });
  if (!user || !user.isArtist || String(user.artist) !== String(artistId)) {
    return new Response(JSON.stringify({ error: "Artist not found or unauthorized" }), {
      status: 404,
    });
  }

  const name = formData.get("name");
  const image = formData.get("image");
  const bio = formData.get("bio");

  let updateFields = {};
  if (name) updateFields.name = name;
  if (bio) updateFields.bio = bio;

  if (image && typeof image === "object") {
    const buffer = Buffer.from(await image.arrayBuffer());
    const secure_url = await uploadToCloudinary(buffer, "spotify/artists", "image");
    updateFields.image = secure_url;
  }

  const artist = await Artist.findByIdAndUpdate(
    artistId,
    { $set: updateFields },
    { new: true }
  );

  if (!artist) {
    return new Response(JSON.stringify({ error: "Artist not found" }), {
      status: 404,
    });
  }

  return new Response(JSON.stringify({ success: true, artist }), { status: 200 });
}
