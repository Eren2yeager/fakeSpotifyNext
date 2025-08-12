import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Song from "@/models/Song";
import User from "@/models/User";
import Album from "@/models/Album";
import Playlist from "@/models/Playlist";

export async function GET(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const seedSongId = searchParams.get("seedSongId");
  const seedArtistId = searchParams.get("seedArtistId");
  const seedAlbumId = searchParams.get("seedAlbumId");
  const seedPlaylistId = searchParams.get("seedPlaylistId");
  const limit = Number(searchParams.get("limit") ?? 25);
  const exclude = searchParams.getAll("exclude");

  // Load seed song if needed to get genre/artist
  let seedSong = null;
  if (seedSongId) {
    seedSong = await Song.findById(seedSongId).populate("artist", "name image _id bio").lean();
  }

  const excludeSet = new Set(exclude.map(String));
  if (seedSongId) excludeSet.add(String(seedSongId));

  // Candidates
  const queries = [];
  // Tier A: same artist other songs
  if (seedArtistId || seedSong?.artist?._id) {
    const artistId = seedArtistId || seedSong.artist._id;
    queries.push(
      Song.find({ artist: artistId, _id: { $ne: seedSongId } })
        .populate("artist", "name image _id bio")
        .sort({ views: -1, createdAt: -1 })
        .limit(limit * 3)
        .lean()
    );
  }
  // Tier B: same genres other artists (any overlap)
  if (Array.isArray(seedSong?.genres) && seedSong.genres.length > 0) {
    queries.push(
      Song.find({ genres: { $in: seedSong.genres }, _id: { $ne: seedSongId } })
        .populate("artist", "name image _id bio")
        .sort({ views: -1, createdAt: -1 })
        .limit(limit * 3)
        .lean()
    );
  }
  // Tier C: same album other tracks
  if (seedAlbumId || seedSong?.album) {
    const albumId = seedAlbumId || seedSong.album;
    queries.push(
      Song.find({ album: albumId, _id: { $ne: seedSongId } })
        .populate("artist", "name image _id bio")
        .sort({ views: -1, createdAt: -1 })
        .limit(limit * 2)
        .lean()
    );
  }
  // Tier D: from the same playlist context
  if (seedPlaylistId) {
    const playlist = await Playlist.findById(seedPlaylistId)
      .populate({ path: "songs.song", select: "name image artist album _id fileUrl genres views createdAt", populate: [{ path: "artist", select: "name image _id bio" }] })
      .lean();
    if (playlist?.songs?.length) {
      const songsFromPlaylist = playlist.songs
        .map(s => s.song)
        .filter(Boolean)
        .filter(s => String(s._id) !== String(seedSongId));
      queries.push(Promise.resolve(songsFromPlaylist.slice(0, limit * 2)));
    }
  }

  // Tier E: user affinity (if logged in) [kept simple]
  let affinityArtists = new Map();
  let affinityGenres = new Map();
  if (session) {
    const dbUser = await User.findById(session.user._id).lean();
    const addCount = (map, key, inc = 1) => { if (!key) return; map.set(key, (map.get(key) || 0) + inc); };
    // From recents.songs
    for (const s of dbUser?.recents?.songs || []) {
      // We need artist/genre; best effort: fetch minimal set later during scoring if absent
      // Lightweight: just collect ids to later fetch
    }
    // From nested recents we will rely on Tier A/B. Keep simple for v1.
  }

  let results = (await Promise.all(queries)).flat();
  // Tier F: fallback by top viewed across site if still not enough
  if (!results || results.length < limit) {
    const topViewed = await Song.find({})
      .populate("artist", "name image _id bio")
      .sort({ views: -1, createdAt: -1 })
      .limit(limit * 3)
      .lean();
    results = [...results, ...topViewed];
  }
  // Dedup by id and filter excludes
  const seen = new Set();
  const deduped = [];
  for (const s of results) {
    const id = String(s._id);
    if (excludeSet.has(id) || seen.has(id) || !s.fileUrl) continue;
    seen.add(id);
    deduped.push(s);
    if (deduped.length >= limit) break;
  }

  return NextResponse.json({ songs: deduped });
}