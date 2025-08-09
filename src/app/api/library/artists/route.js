import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Artist from "@/models/Artist";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    await connectDB();

    // Get the user's library.artists (array of {artist: ObjectId, added})
    const user = await User.findOne({ email: session.user.email }).select("library.artists");
    if (!user || !user.library || !Array.isArray(user.library.artists)) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Extract artist ObjectIds
    const artistIds = user.library.artists.map((entry) => entry.artist);

    // Find all Artist documents referenced in the user's library
    const artists = await Artist.find({ _id: { $in: artistIds } })
      .select("name image bio type")
      .lean();

    // Optionally, sort artists in the same order as in user's library
    const artistsMap = new Map(artists.map((ar) => [ar._id.toString(), ar]));
    const orderedArtists = artistIds
      .map((id) => artistsMap.get(id.toString()))
      .filter(Boolean);

    return Response.json(orderedArtists);
  } catch (error) {
    console.error("❌ Failed to fetch user artists:", error);
    return new Response("Server Error", { status: 500 });
  }
}
