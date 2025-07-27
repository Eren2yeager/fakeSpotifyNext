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

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  await connectDB();

  // 1️⃣ fetch user and populate the embedded songs in every playlist
  const user = await User.findOne({ email: session.user.email }).populate({
    path: "playlists.songs.song",
    populate: [
      { path: "artist", select: "name image bio" },
      { path: "album", select: "name image" },
    ],
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }

  // 2️⃣ extract the requested playlist from the embedded array
  const { id } = await params; //  <- playlist _id comes from the route
  const playlist = user.playlists.id(id);

  if (!playlist) {
    return new Response(JSON.stringify({ error: "Playlist not found" }), {
      status: 404,
    });
  }

  // 3️⃣ send it back (convert to plain JSON first)
  return new Response(JSON.stringify(JSON.parse(JSON.stringify(playlist))), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}










//  to edit the session user playlists
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const formData = await req.formData();
  const type = formData.get("type");

  await connectDB();
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }
  const { id } = await params;
  const playlist = user.playlists.id(id); // playlistId from URL
  if (!playlist) {
    return new Response(JSON.stringify({ error: "Playlist not found" }), {
      status: 404,
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
    console.log(playlist.image);
  }

  if (name) playlist.name = name;
  if (description) playlist.description = description;

  playlist.updatedAt = new Date();

  await user.save();

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
