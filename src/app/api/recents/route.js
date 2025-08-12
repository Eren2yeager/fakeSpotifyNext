import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ recents: null });

  // Populate as before
  const user = await User.findById(session.user._id)
    .populate({
      path: "recents.songs.song",
      select: "name image artist album _id fileUrl type ",
      populate: [
        { path: "artist", select: "name image _id type bio" },
        { path: "album", select: "name image artist _id type", populate: { path: "artist", select: "name image _id type bio" } }
      ]
    })
    .populate({
      path: "recents.albums.album", 
      select: "name image artist _id type",
      populate: { path: "artist", select: "name image _id type bio" }
    })
    .populate({
      path: "recents.albums.songs.song",
      select: "name image artist album _id fileUrl type ",
      populate: [
        { path: "artist", select: "name image _id type bio" },
        { path: "album", select: "name image artist _id type", populate: { path: "artist", select: "name image _id type bio" } }
      ]
    })
    .populate("recents.playlists.playlist", "name image _id type bio")
    .populate({
      path: "recents.playlists.songs.song",
      select: "name image artist album _id fileUrl type ",
      populate: [
        { path: "artist", select: "name image _id type bio" },
        { path: "album", select: "name image artist _id type", populate: { path: "artist", select: "name image _id type bio" } }
      ]
    })
    .populate("recents.artists.artist", "name image _id type bio")
    .populate({
      path: "recents.artists.songs.song",
      select: "name image artist album _id fileUrl type ",
      populate: [
        { path: "artist", select: "name image _id type bio" },
        { path: "album", select: "name image artist _id type", populate: { path: "artist", select: "name image _id type bio" } }
      ]
    })
    .lean();

  // Only keep recents from today
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  function isToday(date) {
    return date >= startOfToday;
  }

  function filterRecentArr(arr) {
    return arr.filter(item => {
      const d = new Date(item.playedAt);
      return isToday(d);
    });
  }

  // Remove old recents from DB (only keep today's)
  let changed = false;
  const userDoc = await User.findById(session.user._id);
  ["songs", "albums", "playlists", "artists"].forEach(type => {
    if (userDoc.recents[type]) {
      const filtered = filterRecentArr(userDoc.recents[type]);
      if (filtered.length !== userDoc.recents[type].length) changed = true;
      userDoc.recents[type] = filtered;
    }
  });
  if (changed) {
    await userDoc.save();
  }

  // Also filter the returned recents to only today
  if (user && user.recents) {
    // Filter out recents whose referenced entity no longer exists
    // For each type, filter out entries where the populated doc is null/undefined
    // For nested songs arrays, also filter out missing songs
    // This will mutate user.recents in-place
    // Songs
    if (user.recents.songs) {
      user.recents.songs = filterRecentArr(
        user.recents.songs.filter(item => item.song) // only keep if song exists
      );
    }
    // Albums
    if (user.recents.albums) {
      user.recents.albums = filterRecentArr(
        user.recents.albums.filter(item => item.album)
      ).map(albumEntry => {
        // Filter out missing songs in album.songs
        if (albumEntry.songs && Array.isArray(albumEntry.songs)) {
          albumEntry.songs = albumEntry.songs.filter(s => s.song);
        }
        return albumEntry;
      });
    }
    // Playlists
    if (user.recents.playlists) {
      user.recents.playlists = filterRecentArr(
        user.recents.playlists.filter(item => item.playlist)
      ).map(playlistEntry => {
        if (playlistEntry.songs && Array.isArray(playlistEntry.songs)) {
          playlistEntry.songs = playlistEntry.songs.filter(s => s.song);
        }
        return playlistEntry;
      });
    }
    // Artists
    if (user.recents.artists) {
      user.recents.artists = filterRecentArr(
        user.recents.artists.filter(item => item.artist)
      ).map(artistEntry => {
        if (artistEntry.songs && Array.isArray(artistEntry.songs)) {
          artistEntry.songs = artistEntry.songs.filter(s => s.song);
        }
        return artistEntry;
      });
    }
  }

  // Optionally, you could also clean up the DB here by removing recents with missing entities,
  // but for now, just return the filtered recents.

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
    case "Album": {
      // Always upsert the album itself to the top, updating playedAt
      let albumIdx = user.recents.albums.findIndex((a) => toStr(a.album) === toStr(entityId));
      if (albumIdx !== -1) {
        // Album already in recents
        const entry = user.recents.albums[albumIdx];
        entry.playedAt = now;
        entry.songs ||= [];
        if (songId) {
          // Remove the song if it already exists, then add to front
          const filtered = entry.songs.filter((s) => toStr(s.song) !== toStr(songId));
          filtered.unshift({ song: songId, playedAt: now });
          entry.songs = filtered.slice(0, cap);
        }
        // Move album entry to the top
        user.recents.albums.splice(albumIdx, 1);
        user.recents.albums.unshift(entry);
        user.recents.albums = user.recents.albums.slice(0, cap);
      } else {
        // Album not in recents, add it
        user.recents.albums.unshift({
          album: entityId,
          playedAt: now,
          songs: songId ? [{ song: songId, playedAt: now }] : []
        });
        user.recents.albums = user.recents.albums.slice(0, cap);
      }
      break;
    }
    case "Playlist": {
      let playlistIdx = user.recents.playlists.findIndex((p) => toStr(p.playlist) === toStr(entityId));
      if (playlistIdx !== -1) {
        const entry = user.recents.playlists[playlistIdx];
        entry.playedAt = now;
        entry.songs ||= [];
        if (songId) {
          const filtered = entry.songs.filter((s) => toStr(s.song) !== toStr(songId));
          filtered.unshift({ song: songId, playedAt: now });
          entry.songs = filtered.slice(0, cap);
        }
        // Move playlist entry to the top
        user.recents.playlists.splice(playlistIdx, 1);
        user.recents.playlists.unshift(entry);
        user.recents.playlists = user.recents.playlists.slice(0, cap);
      } else {
        user.recents.playlists.unshift({
          playlist: entityId,
          playedAt: now,
          songs: songId ? [{ song: songId, playedAt: now }] : []
        });
        user.recents.playlists = user.recents.playlists.slice(0, cap);
      }
      break;
    }
    case "Artist": {
      let artistIdx = user.recents.artists.findIndex((a) => toStr(a.artist) === toStr(entityId));
      if (artistIdx !== -1) {
        const entry = user.recents.artists[artistIdx];
        entry.playedAt = now;
        entry.songs ||= [];
        if (songId) {
          const filtered = entry.songs.filter((s) => toStr(s.song) !== toStr(songId));
          filtered.unshift({ song: songId, playedAt: now });
          entry.songs = filtered.slice(0, cap);
        }
        // Move artist entry to the top
        user.recents.artists.splice(artistIdx, 1);
        user.recents.artists.unshift(entry);
        user.recents.artists = user.recents.artists.slice(0, cap);
      } else {
        user.recents.artists.unshift({
          artist: entityId,
          playedAt: now,
          songs: songId ? [{ song: songId, playedAt: now }] : []
        });
        user.recents.artists = user.recents.artists.slice(0, cap);
      }
      break;
    }
    default: {
      // For "Song" or unknown, just upsert the song
      user.recents.songs = upsertTop(user.recents.songs, "song", songId);
      break;
    }
  }

  user.markModified("recents");
  await user.save();
  return NextResponse.json({ ok: true });
}