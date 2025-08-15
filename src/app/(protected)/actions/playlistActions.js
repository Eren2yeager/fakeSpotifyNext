"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

import Playlist from "@/models/Playlist";

//  to create a new playlist by click
export async function createPlaylistForUser() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  await connectDB();

  const user = await User.findOne({ email: session?.user.email });
  if (!user) return null;

  // Count user's library playlists for naming
  const playlistCount = user.library?.playlists?.length || 0;

  // 1. Create a new Playlist document
  const newPlaylist = await Playlist.create({
    name: `My Playlist #${playlistCount + 1}`,
    type: "Playlist",
    image: "/images/notfound.png",
    songs: [],
    createdBy: user._id,
    createdAt: new Date(),
    // updatedAt will be handled by mongoose timestamps if enabled
  });

  // 2. Add the new playlist's id to user's library.playlists
  user.library = user.library || {};
  user.library.playlists = user.library.playlists || [];
  user.library.playlists.push({
    playlist: newPlaylist._id,
    added: new Date(),
  });

  await user.save();

  // Optionally, return the new playlist (as a plain object)
  return {
    name: newPlaylist.name,
    image: newPlaylist.image,

  };
}

//  to edit a playlist



// Delete a playlist according to the new playlist and userModel

export async function deletePlaylist(playlistId) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  await connectDB();

  // Find the playlist by its ID
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new Error("Playlist not found");
  }

  // Only allow deletion if the user is the creator
  const userId = session?.user._id || session?.user.id;
  if (playlist.createdBy?.toString() !== userId?.toString()) {
    // Remove the playlist from the user's library.playlists array (new userModel)

    await User.updateOne(
      { _id: userId },
      { $pull: { "library.playlists": { playlist: playlistId } } }
    );
  } else {
    // Remove the playlist from the user's library.playlists array (new userModel)
    await User.updateOne(
      { _id: userId },
      { $pull: { "library.playlists": { playlist: playlistId } } }
    );

    // Delete the playlist document itself
    await Playlist.deleteOne({ _id: playlistId });
  }

  return true;
}

export async function togglePlaylistPublic(playlistId) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  await connectDB();

  // Find the playlist by its ID
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new Error("Playlist not found");
  }

  // Only allow toggling if the user is the creator
  const userId = session?.user._id || session?.user.id;
  if (playlist.createdBy?.toString() !== userId?.toString()) {
    throw new Error("Forbidden: Only the creator can toggle public status");
  }

  playlist.isPublic = !playlist.isPublic;
  playlist.updatedAt = new Date();

  await playlist.save();

  return playlist.isPublic;
}

export async function toggleSavePublicPlaylist(playlistId) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  await connectDB();

  // Find the playlist by its ID
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new Error("Playlist not found");
  }

  // Only allow saving public playlists
  if (!playlist.isPublic) {
    throw new Error("Cannot save a private playlist");
  }

  const userId = session?.user._id || session?.user.id;

  // Find the user
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new Error("User not found");
  }

  // Check if playlist is already in user's library
  const alreadySaved = Array.isArray(user.library?.playlists)
    ? user.library.playlists.some(
        (entry) => entry.playlist?.toString() === playlistId.toString()
      )
    : false;

  // Check if user is already in playlist.savedBy
  const alreadyInSavedBy = Array.isArray(playlist.savedBy)
    ? playlist.savedBy.some(
        (id) => id?.toString() === userId.toString()
      )
    : false;

  if (alreadySaved && alreadyInSavedBy) {
    // Undo: Remove from user's library and from playlist.savedBy
    await User.updateOne(
      { _id: userId },
      { $pull: { "library.playlists": { playlist: playlistId } } }
    );
    await Playlist.updateOne(
      { _id: playlistId },
      { $pull: { savedBy: userId } }
    );
    return false
  } else {
    // Save: Add to user's library and to playlist.savedBy
    await User.updateOne(
      { _id: userId },
      {
        $addToSet: {
          "library.playlists": {
            playlist: playlistId,
            added: new Date(),
          },
        },
      }
    );
    await Playlist.updateOne(
      { _id: playlistId },
      { $addToSet: { savedBy: userId } }
    );
    return true;
  }
}
