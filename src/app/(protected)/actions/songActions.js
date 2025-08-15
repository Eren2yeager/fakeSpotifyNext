'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import mongoose from 'mongoose';

/* -----------------------------------------------------------
   helper – make sure the user has a "Liked" playlist
----------------------------------------------------------- */
// async function createLikedPlaylistIfMissing(user) {
//   const liked = user.playlists.find(p => p.type === 'Liked');
//   if (!liked) {
//     user.playlists.unshift({
//       _id: new mongoose.Types.ObjectId(), // create an id for the embedded playlist
//       type: 'Liked',
//       name: 'Liked Songs',
//       image: '/images/liked.png',
//       description: 'Your liked songs',
//       songs: [],
//     });
//     await user.save();
//   }
// }

/* -----------------------------------------------------------
   toggle like / unlike
----------------------------------------------------------- */
import Playlist from "@/models/Playlist";

/**
 * Toggle like/unlike a song for the current user.
 * Uses the new Playlist model and user's library.playlists.
 */
export async function toggleLikeSong(songId) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // Find the user and their "Liked Songs" playlist in their library
  const user = await User.findOne(
    { email: session?.user.email },
    { "library.playlists.playlist": 1 }
  ).lean();

  if (!user || !user.library || !Array.isArray(user.library.playlists)) {
    throw new Error("User not found");
  }

  // Find the user's "Liked Songs" playlist (specialtype: 'Liked')
  // We'll assume the "Liked Songs" playlist is always present in the user's library
  // and is the only playlist with type 'Liked' or specialtype 'Liked'
  // If not found, throw error (should be created at signup)
  const playlistIds = user.library.playlists.map((entry) => entry.playlist);

  // Find the actual Playlist document with type 'Liked'
  const likedPlaylist = await Playlist.findOne({
    _id: { $in: playlistIds },
    specialtype: "Liked",
  });

  if (!likedPlaylist) throw new Error("Liked Songs playlist not found");

  const songIdStr = songId.toString();
  const already = Array.isArray(likedPlaylist.songs)
    ? likedPlaylist.songs.some((s) => s.song && s.song.toString() === songIdStr)
    : false;

  if (already) {
    // Unlike: remove the song from the playlist
    likedPlaylist.songs = likedPlaylist.songs.filter(
      (s) => s.song && s.song.toString() !== songIdStr
    );
  } else {
    // Like: add the song to the beginning of the playlist
    likedPlaylist.songs.unshift({ song: songId, added: new Date() });
  }

  await likedPlaylist.save();
  return { liked: !already };
}

/**
 * Add a song to a playlist (by playlistId) for the current user.
 * Only allows if the playlist is in the user's library.
 */
export async function addSongToPlaylist(songId, playlistId) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // Check that the playlist is in the user's library
  const user = await User.findOne(
    { email: session?.user.email },
    { "library.playlists.playlist": 1 }
  ).lean();

  if (
    !user ||
    !user.library ||
    !Array.isArray(user.library.playlists) ||
    !user.library.playlists.some(
      (entry) => entry.playlist.toString() === playlistId.toString()
    )
  ) {
    throw new Error("Playlist not found in user's library");
  }

  // Add the song to the playlist if not already present
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new Error("Playlist not found");

  const songIdStr = songId.toString();
  const already = Array.isArray(playlist.songs)
    ? playlist.songs.some((s) => s.song && s.song.toString() === songIdStr)
    : false;

  if (!already) {
    playlist.songs.push({ song: songId, added: new Date() });
    await playlist.save();
  }
}

/**
 * Remove a song from a playlist (by playlistId) for the current user.
 * Only allows if the playlist is in the user's library.
 */
export async function removeSongFromPlaylist(songId, playlistId) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // Check that the playlist is in the user's library
  const user = await User.findOne(
    { email: session?.user.email },
    { "library.playlists.playlist": 1 }
  ).lean();

  if (
    !user ||
    !user.library ||
    !Array.isArray(user.library.playlists) ||
    !user.library.playlists.some(
      (entry) => entry.playlist.toString() === playlistId.toString()
    )
  ) {
    throw new Error("Playlist not found in user's library");
  }

  // Remove the song from the playlist if present
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new Error("Playlist not found");

  const songIdStr = songId.toString();
  const beforeCount = Array.isArray(playlist.songs) ? playlist.songs.length : 0;
  playlist.songs = Array.isArray(playlist.songs)
    ? playlist.songs.filter((s) => s.song && s.song.toString() !== songIdStr)
    : [];
  const afterCount = playlist.songs.length;

  if (afterCount !== beforeCount) {
    await playlist.save();
  }
}
