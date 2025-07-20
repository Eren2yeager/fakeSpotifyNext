"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";

//  to create a new playlist by click
export async function createPlaylistForUser() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  await connectDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return null;
   
  const lengthOfPlaylists = user.playlists.length;


  const newPlaylist = {
    name: `My Playlist #${lengthOfPlaylists +1}`,
    type: "Playlist",
    image: "/images/notfound.png",
    description: "New playlist created",
    songs: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  user.playlists.unshift(newPlaylist);
  const isSaved = await user.save();

  if (isSaved) {
    session.user.playlists = user.playlists;
  }

  console.log("these are updated playlists: ", session.user.playlists);

  return newPlaylist;
}


//  to edit a playlist

export async function editPlaylist(playlistId, formData) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  await connectDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return null;

  const playlist = user.playlists.id(playlistId);
  if (!playlist) return null;

  // Fields
  const name = formData.get("name");
  const description = formData.get("description");
  const image = formData.get("image");

  // Optional image upload
  if (image && typeof image !== "string") {
    const buffer = Buffer.from(await image.arrayBuffer());
    const uploaded = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "playlists",
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    playlist.image = uploaded.secure_url;
  }

  // Update text fields
  if (name) playlist.name = name;
  if (description) playlist.description = description;
  playlist.updatedAt = new Date();

  await user.save();

  return true;
}



//  to delete a playlist 

export async function deletePlaylist(playlistId) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    throw new Error("User not found");
  }

  const playlist = user.playlists.id(playlistId);
  if (!playlist) {
    throw new Error("Playlist not found");
  }

  // Remove the playlist from array
  playlist.deleteOne();
  await user.save();

  return true
}
