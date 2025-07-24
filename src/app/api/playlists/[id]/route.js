import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  await connectDB();

  // 1️⃣ fetch user and populate the embedded songs in every playlist
  const user = await User.findOne({ email: session.user.email })
    .populate({
      path: "playlists.songs.song",
      populate: [
        { path: "artist", select: "name image" },
        { path: "album",  select: "name coverImage" },
      ],
    });

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  }

  // 2️⃣ extract the requested playlist from the embedded array
  const { id } = await params;                 //  <- playlist _id comes from the route
  const playlist = user.playlists.id(id);

  if (!playlist) {
    return new Response(JSON.stringify({ error: "Playlist not found" }), { status: 404 });
  }


  // 3️⃣ send it back (convert to plain JSON first)
  return new Response(JSON.stringify(JSON.parse(JSON.stringify(playlist))), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

