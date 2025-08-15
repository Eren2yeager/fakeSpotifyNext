'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import mongoose from 'mongoose';

/* -------------------------------------------------
   1️⃣  isSongInAnyPlaylist(songId)  → boolean
   Updated for new userModel: user's playlists are in user.library.playlists,
   and each entry is { playlist: ObjectId, added: Date }
   Need to check all playlists created by the user for the song.
------------------------------------------------- */
import Playlist from "@/models/Playlist";

export async function isSongInAnyPlaylist(songId) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  // Find the user and get their playlist IDs from the new userModel
  const user = await User.findOne(
    { email: session?.user.email },
    { "library.playlists.playlist": 1 }
  );

  if (!user || !user.library || !Array.isArray(user.library.playlists)) return false;

  const playlistIds = user.library.playlists.map((entry) => entry.playlist);

  if (playlistIds.length === 0) return false;

  // Query all playlists by these IDs and check if any contains the song
  const idStr = songId.toString();

  const playlists = await Playlist.find(
    { _id: { $in: playlistIds }, "songs.song": songId },
    { "songs.song": 1 }
  );

  // Check if any playlist contains the song
  for (const playlist of playlists) {
    if (
      Array.isArray(playlist.songs) &&
      playlist.songs.some((s) => s.song && s.song.toString() === idStr)
    ) {
      return true;
    }
  }

  return false;
}

/* -------------------------------------------------
   2️⃣  isSongInSpecificPlaylist(songId, playlistId)
------------------------------------------------- */
export async function isSongInSpecificPlaylist(songId, playlistId) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  // Find the user and ensure the playlist is in their library
  const user = await User.findOne(
    { email: session?.user.email },
    { "library.playlists.playlist": 1 }
  );

  if (
    !user ||
    !user.library ||
    !Array.isArray(user.library.playlists) ||
    !user.library.playlists.some((entry) => entry.playlist.toString() === playlistId.toString())
  ) {
    return false;
  }

  // Now, fetch the playlist and check if it contains the song
  const playlist = await Playlist.findOne(
    { _id: playlistId },
    { "songs.song": 1 }
  );

  if (!playlist || !Array.isArray(playlist.songs)) return false;

  const idStr = songId.toString();
  const found = playlist.songs.some(
    (s) => s.song && s.song.toString() === idStr
  );

  return found;
}
