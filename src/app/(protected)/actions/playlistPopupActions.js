"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import mongoose from "mongoose";

export async function getPlaylistsWithSong(songId) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthenticated");

  const user = await User.findOne({ email: session.user.email }, {
    playlists: 1,
  }).lean();

  return user.playlists.map((pl) => ({
    _id: pl._id.toString(),
    name: pl.name,
    songsCount: pl.songs.length,
    contains: pl.songs.some((s) => s.song.toString() === songId),
  }));
}

export async function applySongPlaylistChanges(songId, updates) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthenticated");

  const user = await User.findOne({ email: session.user.email });
  if (!user) throw new Error("User not found");

  updates.forEach(({ playlistId, add }) => {
    const pl = user.playlists.id(playlistId);
    if (!pl) return;
    const exists = pl.songs.some((s) => s.song.toString() === songId);
    if (add && !exists) pl.songs.push({ song: songId, added: new Date() });
    if (!add && exists)
      pl.songs = pl.songs.filter((s) => s.song.toString() !== songId);
  });

  await user.save();
}

export async function createPlaylistShell(song) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthenticated");

  const newPl = {
    _id: new mongoose.Types.ObjectId(),
    image: song.image,
    name : song.name,
    type: "Playlist",
    songs: [{ song: song._id, added: new Date() }],
    createdAt: new Date(),
  };

  await User.updateOne(
    { email: session.user.email },
    { $push: { playlists: newPl } }
  );

  return { name : newPl.name , image: newPl.image};
}
