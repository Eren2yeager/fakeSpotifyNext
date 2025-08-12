import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Song from "@/models/Song";
import Album from "@/models/Album";
import Playlist from "@/models/Playlist";

export async function GET(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || 24);

  let followingUserIds = [];
  let followingArtistIds = [];
  if (session?.user?.email) {
    const me = await User.findOne({ email: session.user.email })
      .select("following")
      .lean();
    followingUserIds = (me?.following?.users || []).map((id) => id.toString());
    followingArtistIds = (me?.following?.artists || []).map((id) => id.toString());
  }

  const queries = {
    newReleaseAlbums: followingArtistIds.length
      ? Album.find({ artist: { $in: followingArtistIds } })
          .populate({ path: "artist", select: "name image _id type bio" })
          .sort({ releaseDate: -1, createdAt: -1 })
          .limit(limit)
          .lean()
      : Album.find({})
          .populate({ path: "artist", select: "name image _id type bio" })
          .sort({ releaseDate: -1, createdAt: -1 })
          .limit(limit)
          .lean(),

    newSongsFromArtists: followingArtistIds.length
      ? Song.find({ artist: { $in: followingArtistIds } })
          .populate([{ path: "artist", select: "name image _id type bio" }, { path: "album", select: "name image _id type" }])
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean()
      : Song.find({})
          .populate([{ path: "artist", select: "name image _id type bio" }, { path: "album", select: "name image _id type" }])
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),

    playlistsFromFollowing: followingUserIds.length
      ? Playlist.find({ createdBy: { $in: followingUserIds }, isPublic: true })
          .populate({ path: "createdBy", select: "name image _id type" })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean()
      : Playlist.find({ isPublic: true })
          .populate({ path: "createdBy", select: "name image _id type" })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean(),

    trendingSongs: Song.find({})
      .populate([{ path: "artist", select: "name image _id type bio" }, { path: "album", select: "name image _id type" }])
      .sort({ views: -1, createdAt: -1 })
      .limit(limit)
      .lean(),
  };

  const [newReleaseAlbums, newSongsFromArtists, playlistsFromFollowing, trendingSongs] = await Promise.all([
    queries.newReleaseAlbums,
    queries.newSongsFromArtists,
    queries.playlistsFromFollowing,
    queries.trendingSongs,
  ]);

  return NextResponse.json({
    newReleaseAlbums,
    newSongsFromArtists,
    playlistsFromFollowing,
    trendingSongs,
  });
}


