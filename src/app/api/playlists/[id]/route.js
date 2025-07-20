import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }

  const {id} = await params;
  const playlist = user.playlists.id(id);
  if (!playlist) {
    return new Response(JSON.stringify({ error: "Playlist not found" }), {
      status: 404,
    });
  }

  // Convert to plain object
  const plainPlaylist = JSON.parse(JSON.stringify(playlist));

  return new Response(JSON.stringify(plainPlaylist), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
