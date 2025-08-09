"use server"
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Album from "@/models/Album";
import User from "@/models/User";
// Check if the current user has saved the album
export async function isSavedAlbum(albumId) {
  console.log("this is Album 1" ,Album)
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return false;

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) return false;

    // user.library.albums is assumed to be an array of objects: { album: ObjectId, added: Date }
    const found = user.library?.albums?.some(
      (item) => item.album.toString() === albumId.toString()
    );
    return !!found;
  } catch (err) {
    console.error("Failed to check saved album:", err);
    return false;
  }
}

// Toggle save/unsave album for the current user
export async function toggleSavedAlbum(albumId) {
  console.log("this is Album 2" ,Album)
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) throw new Error("User not found");

    const album = await Album.findById(albumId);
    if (!album) throw new Error("Album not found");

    if (!user.library) user.library = {};
    if (!Array.isArray(user.library.albums)) user.library.albums = [];

    const albumIdStr = album._id.toString();
    const isSaved = user.library.albums.some(
      (item) => item.album.toString() === albumIdStr
    );

    if (isSaved) {
      // Unsave: remove from user.library.albums
      user.library.albums = user.library.albums.filter(
        (item) => item.album.toString() !== albumIdStr
      );
    } else {
      // Save: add to user.library.albums
      user.library.albums.push({ album: album._id, added: new Date() });
    }

    await user.save();

    return { saved: !isSaved };
  } catch (err) {
    console.error("Failed to toggle saved album:", err);
    return { saved: false, error: err.message };
  }
}
