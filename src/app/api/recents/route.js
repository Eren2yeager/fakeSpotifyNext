import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ recents: null });
  const user = await User.findById(session.user._id)
    .populate({
      path: "recents.songs.song",
      select: "name image artist album _id",
      populate: { path: "artist", select: "name _id" }
    })
    .populate({
      path: "recents.albums.album", 
      select: "name image artist _id",
      populate: { path: "artist", select: "name _id" }
    })
    .populate("recents.playlists.playlist", "name image _id")
    .populate("recents.artists.artist", "name image _id")
    .lean();
  return NextResponse.json({ recents: user?.recents ?? null });
}

export async function POST(req) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { entityType, entityId, songId } = await req.json();

  const user = await User.findById(session.user._id);

  const cap = 50;
  const now = new Date();
  const toStr = (v) => (v ? String(v) : "");

  const ensureRecentsShape = () => {
    if (!user.recents) user.recents = {};
    user.recents.songs ||= [];
    user.recents.albums ||= [];
    user.recents.playlists ||= [];
    user.recents.artists ||= [];
  };

  ensureRecentsShape();

  // Helper: remove existing by key/id and unshift new entry, then cap
  const upsertTop = (arr, key, id, extra = {}) => {
    const idStr = toStr(id);
    const filtered = arr.filter((x) => toStr(x[key]) !== idStr);
    filtered.unshift({ [key]: id, playedAt: now, ...extra });
    return filtered.slice(0, cap);
  };

  switch (entityType) {
    case "Song": {
      user.recents.songs = upsertTop(user.recents.songs, "song", entityId);
      break;
    }
    case "Album": {
      // Top-level album recent
      user.recents.albums = upsertTop(user.recents.albums, "album", entityId);
      // If a song within this album was played
      if (songId) {
        const idx = user.recents.albums.findIndex((a) => toStr(a.album) === toStr(entityId));
        if (idx !== -1) {
          const entry = user.recents.albums[idx];
          entry.songs ||= [];
          const filtered = entry.songs.filter((s) => toStr(s.song) !== toStr(songId));
          filtered.unshift({ song: songId, playedAt: now });
          entry.songs = filtered.slice(0, cap);
          user.recents.albums[idx] = entry;
        }
      }
      break;
    }
    case "Playlist": {
      user.recents.playlists = upsertTop(user.recents.playlists, "playlist", entityId);
      if (songId) {
        const idx = user.recents.playlists.findIndex((p) => toStr(p.playlist) === toStr(entityId));
        if (idx !== -1) {
          const entry = user.recents.playlists[idx];
          entry.songs ||= [];
          const filtered = entry.songs.filter((s) => toStr(s.song) !== toStr(songId));
          filtered.unshift({ song: songId, playedAt: now });
          entry.songs = filtered.slice(0, cap);
          user.recents.playlists[idx] = entry;
        }
      }
      break;
    }
    case "Artist": {
      user.recents.artists = upsertTop(user.recents.artists, "artist", entityId);
      if (songId) {
        const idx = user.recents.artists.findIndex((a) => toStr(a.artist) === toStr(entityId));
        if (idx !== -1) {
          const entry = user.recents.artists[idx];
          entry.songs ||= [];
          const filtered = entry.songs.filter((s) => toStr(s.song) !== toStr(songId));
          filtered.unshift({ song: songId, playedAt: now });
          entry.songs = filtered.slice(0, cap);
          user.recents.artists[idx] = entry;
        }
      }
      break;
    }
    default: {
      return NextResponse.json({ error: "Invalid entityType" }, { status: 400 });
    }
  }

  user.markModified("recents");
  await user.save();
  return NextResponse.json({ ok: true });
}