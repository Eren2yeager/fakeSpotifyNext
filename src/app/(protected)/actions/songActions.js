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
export async function toggleLikeSong(songId) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const user = await User.findOne({ email: session.user.email });
  if (!user) throw new Error('User not found');

//   await createLikedPlaylistIfMissing(user);

  const likedPlaylist = user.playlists.find(p => p.specialtype === 'Liked');

  const already = likedPlaylist.songs.some(
    (s) => s.song.toString() === songId
  );

  if (already) {
    // unlike ➖
    likedPlaylist.songs = likedPlaylist.songs.filter(
      (s) => s.song.toString() !== songId
    );
  } else {
    // like ➕
    likedPlaylist.songs.unshift({ song: songId });
  }

  await user.save();
  return { liked: !already };
}

/* -----------------------------------------------------------
   add / remove song in any playlist (by playlistId)
----------------------------------------------------------- */
export async function addSongToPlaylist(songId, playlistId) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  await User.updateOne(
    { email: session.user.email, 'playlists._id': playlistId },
    {
      $addToSet: { 'playlists.$.songs': { song: songId } },
    }
  );
}

export async function removeSongFromPlaylist(songId, playlistId) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  await User.updateOne(
    { email: session.user.email, 'playlists._id': playlistId },
    {
      $pull: { 'playlists.$.songs': { song: songId } },
    }
  );
}



