"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

import Playlist from "@/models/Playlist";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  await connectDB();

  const { id } =await params;
  let playlist = await Playlist.findById(id).populate({path : "createdBy" , select :"_id name image"})
    .populate({
      path: "songs.song",
      populate: [
        { path: "artist", select: "name image bio type" },
        { path: "album", select: "name image" },
      ],
    })
    .lean();

  if (!playlist) {
    return new Response(JSON.stringify({ error: "Playlist not found" }), {
      status: 404,
    });
  }

  // Remove any songs where the referenced song no longer exists
  if (Array.isArray(playlist.songs) && playlist.songs.length > 0) {
    const filteredSongs = playlist.songs.filter((songObj) => songObj.song !== null);
    if (filteredSongs.length !== playlist.songs.length) {
      // Update the playlist in the database if there were removed songs
      await Playlist.findByIdAndUpdate(id, { songs: filteredSongs });
      // Re-fetch the playlist with population after update
      playlist = await Playlist.findById(id)
        .populate({
          path: "songs.song",
          populate: [
            { path: "artist", select: "name image bio type" },
            { path: "album", select: "name image" },
          ],
        })
        .lean();
    }
  }

  return new Response(JSON.stringify(playlist), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  await connectDB();

  const formData = await req.formData();
  const { id } =await params;
  const playlist = await Playlist.findById(id);

  if (!playlist) {
    return new Response(JSON.stringify({ error: "Playlist not found" }), {
      status: 404,
    });
  }

  // Only allow editing if the user is the creator
  // Accept both _id and id from session.user for compatibility
  const userId = session.user._id || session.user.id;
  if (playlist.createdBy?.toString() !== userId?.toString()) {
    return new Response(JSON.stringify({ error: "You do not have permission to edit this playlist."}), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  const name = formData.get("name");
  const description = formData.get("description");
  const image = formData.get("image");

  if (image && typeof image === "object") {
    const buffer = Buffer.from(await image.arrayBuffer());
    const secure_url = await uploadToCloudinary(
      buffer,
      "spotify/playlists",
      "image"
    );
    playlist.image = secure_url;
  }

  if (name) playlist.name = name;
  if (description) playlist.description = description;

  playlist.updatedAt = new Date();

  await playlist.save();

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
