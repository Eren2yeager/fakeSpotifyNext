'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import mongoose from 'mongoose';

/* -------------------------------------------------
   1️⃣  isSongInAnyPlaylist(songId)  → boolean
------------------------------------------------- */
export async function isSongInAnyPlaylist(songId) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const user = await User.findOne(
    { email: session.user.email },
    { 'playlists.songs.song': 1 }      // just need song IDs
  );

  if (!user) return false;

  const idStr = songId.toString();

  const found = user.playlists.some((pl) =>
    pl.songs.some((s) => s.song.toString() === idStr)
  );

  return found;      // ➜ true / false
}

/* -------------------------------------------------
   2️⃣  isSongInSpecificPlaylist(songId, playlistId)
------------------------------------------------- */
export async function isSongInSpecificPlaylist(songId, playlistId) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const user = await User.findOne(
    { email: session.user.email, 'playlists._id': playlistId },
    { 'playlists.$': 1 }               // project only that playlist
  );

  if (!user || user.playlists.length === 0) return false;

  const idStr = songId.toString();
  const playlist = user.playlists[0];

  const found = playlist.songs.some(
    (s) => s.song.toString() === idStr
  );

  return found;      // ➜ true / false
}
