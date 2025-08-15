
import { NextResponse } from "next/server";
import { revalidatePath } from 'next/cache';
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";


export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const type = formData.get("type");

  // to get the user
  if (type === "getUser") {
    const userId = formData.get("userId");

    await connectDB();
    // Populate 'followers' and 'following' with user info (id, name, image)
    // Yes, you are doing it right! This code finds the user by ID and populates the followers and following fields with the specified user info.
    const user = await User.findById(userId)
      .populate({ path: 'followers.users', select: '_id type name image' })
      .populate({ path: 'followers.artists', select: '_id type name image' })
      .populate({ path: 'following.users', select: '_id type name image' })
      .populate({ path: 'following.artists', select: '_id type name image' })



    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get public playlists and populate songs and createdBy
    // user.library.playlists is an array of { playlist, added }
    // We want to get the actual Playlist documents for public playlists
    // and populate their songs and createdBy

    // Import Playlist model here to avoid circular import issues
    const Playlist = (await import('@/models/Playlist')).default;

    // Get all playlist IDs from user's library
    const playlistIds = user.library?.playlists?.map(pl => pl.playlist) || [];

    // Find public playlists
    const publicPlaylists = await Playlist.find({
      _id: { $in: playlistIds },
      isPublic: true
    })
      .populate({
        path: 'songs',
        populate: { path: 'artist album', select: '_id name image fileUrl' }
      })
      .populate({
        path: 'createdBy',
        select: '_id name image type'
      });

    // Attach publicPlaylists to user object for response
    // (convert user toObject to allow adding new property)
    const userObj = user.toObject();
    userObj.publicPlaylists = publicPlaylists;

    return NextResponse.json({ user: userObj });
  }

  // for edit profile
  if (type === "editProfile") {
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const name = formData.get("name");
    const image = formData.get("image");

    if (name) user.name = name;

    if (image && typeof image === "object") {
      const buffer = Buffer.from(await image.arrayBuffer());
      const cloudinary = (await import("@/lib/cloudinary")).default;
      const uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "spotify/users",
              resource_type: "image",
            },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          )
          .end(buffer);
      });

      user.image = uploaded.secure_url;
    }

    await user.save();
    revalidatePath("/profile")
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
