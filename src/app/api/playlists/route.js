import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    await connectDB();

    const user = await User.findOne({ email: session.user.email })
      .populate({
        path: "playlists.songs.song",
        populate: [
          { path: "artist", select: "name image bio" }, 
          { path: "album", select: "name coverImage" }

        ],
      })
      .select("playlists");

    return Response.json(user.playlists);
  } catch (error) {
    console.error("❌ Failed to fetch user playlists:", error);
    return new Response("Server Error", { status: 500 });
  }
}
