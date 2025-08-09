import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Album from "@/models/Album";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    await connectDB();

    // Get the user's library.albums (array of {album: ObjectId, added})
    const user = await User.findOne({ email: session.user.email }).select("library.albums");
    if (!user || !user.library || !Array.isArray(user.library.albums)) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Extract album ObjectIds
    const albumIds = user.library.albums.map((entry) => entry.album);

    // Find all Album documents referenced in the user's library
    const albums = await Album.find({ _id: { $in: albumIds } })
      .populate([
        { path: "artist", select: "name image bio type" },
        { path: "songs", populate: { path: "artist album", select: "name image" } }
      ])
      .lean();

    // Optionally, sort albums in the same order as in user's library
    const albumsMap = new Map(albums.map((al) => [al._id.toString(), al]));
    const orderedAlbums = albumIds
      .map((id) => albumsMap.get(id.toString()))
      .filter(Boolean);

    return Response.json(orderedAlbums);
  } catch (error) {
    console.error("❌ Failed to fetch user albums:", error);
    return new Response("Server Error", { status: 500 });
  }
}
