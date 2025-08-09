import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

import Playlist from "@/models/Playlist";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    await connectDB();

    // Get the user's library.playlists (array of {playlist: ObjectId, added})
    const user = await User.findOne({ email: session.user.email }).select("library.playlists");
    if (!user || !user.library || !Array.isArray(user.library.playlists)) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Extract playlist ObjectIds
    const playlistIds = user.library.playlists.map((entry) => entry.playlist);

    // Find all Playlist documents referenced in the user's library
    const playlists = await Playlist.find({ _id: { $in: playlistIds } })
      .populate({
        path: "songs.song",
        populate: [
          { path: "artist", select: "name image bio type" },
          { path: "album", select: "name image" },
        ],
      })
      .lean();

    // Optionally, sort playlists in the same order as in user's library
    const playlistsMap = new Map(playlists.map((pl) => [pl._id.toString(), pl]));
    const orderedPlaylists = playlistIds
      .map((id) => playlistsMap.get(id.toString()))
      .filter(Boolean);

    return Response.json(orderedPlaylists);
  } catch (error) {
    console.error("❌ Failed to fetch user playlists:", error);
    return new Response("Server Error", { status: 500 });
  }
}
