import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import Song from "@/models/Song";
import Artist from "@/models/Artist";
import User from "@/models/User";
import { getArtistFromSession } from "@/app/(protected)/actions/artistActions";

export async function GET() {
  try {
    // Use getArtistFromSession for consistent session/artist lookup
    const artist = await getArtistFromSession();
    if (!artist) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(artist);
    await connectDB();

    // Find the artist by _id (from session), and populate songs and albums
    const artistDoc = await Artist.findById(artist._id)
      .populate({
        path: "songs",
        populate: { path: "artist" },
      })
      .populate({
        path: "albums",
      })
      .populate({ path: "followers.users", select: "_id type name image" })
      .populate({ path: "followers.artists", select: "_id type name image" })
      .populate({ path: "following.users", select: "_id type name image" })
      .populate({ path: "following.artists", select: "_id type name image" });

    if (!artistDoc) {
      return Response.json({ error: "Artist not found" }, { status: 404 });
    }

    return Response.json(artistDoc);
  } catch (err) {
    console.error("Error in /api/artist GET:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
