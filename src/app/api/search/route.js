import Album from "@/models/Album";
import Song from "@/models/Song";
import User from "@/models/User";
import Artist from "@/models/Artist";

import Playlist from "@/models/Playlist";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.trim() === "") {
    return new Response(JSON.stringify({ error: "Search query is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const regex = new RegExp(query, "i"); // Case-insensitive regex

    const [songs, artists, albums, playlists, users] = await Promise.all([
      Song.find({ name: regex })
        .populate("artist")
        .populate("album"),
      Artist.find({ name: regex }),
      Album.find({ name: regex }).populate("artist"),
      Playlist.find({ name: regex, isPublic: true }).populate({ path: "createdBy", select: "_id name image" }),
      User.find({ name: regex }).select("_id name image type"),
    ]);

    // Determine top result — e.g. pick first matching song if exists
    const top = songs[0] || artists[0] || albums[0] || playlists[0] || users[0] || null;

    return new Response(JSON.stringify({
      top,
      songs: songs,
      artists: artists,
      albums: albums,
      playlists: playlists,
      users: users,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Search error:", error);
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}