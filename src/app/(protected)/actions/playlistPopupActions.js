"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

import Playlist from "@/models/Playlist";

// Get all user's playlists, and for each, check if it contains the song
export async function getPlaylistsWithSong(songId) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthenticated");

  // Get user's playlist ids from new user model
  const user = await User.findOne(
    { email: session.user.email },
    { "library.playlists.playlist": 1 }
  ).lean();

  if (!user || !user.library || !Array.isArray(user.library.playlists)) return [];

  const playlistIds = user.library.playlists.map((entry) => entry.playlist);

  if (playlistIds.length === 0) return [];

  // Fetch all playlists by these ids
  const playlists = await Playlist.find(
    { _id: { $in: playlistIds } },
    { name: 1, songs: 1 }
  ).lean();

  const songIdStr = songId.toString();

  return playlists.map((pl) => ({
    _id: pl._id.toString(),
    name: pl.name,
    songsCount: Array.isArray(pl.songs) ? pl.songs.length : 0,
    contains: Array.isArray(pl.songs)
      ? pl.songs.some((s) => s.song && s.song.toString() === songIdStr)
      : false,
  }));
}

// Add or remove a song from multiple playlists according to updates
export async function applySongPlaylistChanges(songId, updates) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthenticated");

  // Get user's playlist ids from new user model
  const user = await User.findOne(
    { email: session.user.email },
    { "library.playlists.playlist": 1 }
  ).lean();

  if (!user || !user.library || !Array.isArray(user.library.playlists)) throw new Error("User not found");

  const playlistIds = user.library.playlists.map((entry) => entry.playlist.toString());

  // Only allow updates to playlists the user owns
  for (const { playlistId, add } of updates) {
    if (!playlistIds.includes(playlistId.toString())) continue;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) continue;

    const exists = Array.isArray(playlist.songs)
      ? playlist.songs.some((s) => s.song && s.song.toString() === songId.toString())
      : false;

    if (add && !exists) {
      playlist.songs.push({ song: songId, added: new Date() });
      await playlist.save();
    }
    if (!add && exists) {
      playlist.songs = playlist.songs.filter((s) => s.song && s.song.toString() !== songId.toString());
      await playlist.save();
    }
  }
}

// Create a new playlist with the song, and add it to user's library.playlists
export async function createPlaylistShell(song) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthenticated");

  // Create the playlist document
  const newPlaylist = await Playlist.create({
    name: song.name,
    image: song.image,
    type: "Playlist",
    songs: [{ song: song._id, added: new Date() }],
    createdBy: session.user.id || session.user._id,
    createdAt: new Date(),
  });

  // Add the playlist to user's library.playlists
  await User.updateOne(
    { email: session.user.email },
    {
      $push: {
        "library.playlists": {
          playlist: newPlaylist._id,
          added: new Date(),
        },
      },
    }
  );

  return { name: newPlaylist.name, image: newPlaylist.image };
}
