"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Artist from "@/models/Artist";

export async function getArtistFromSession() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  await connectDB();
  const user = await User.findOne({ email: session?.user.email });
  if (!user) return null;

  const artist = await Artist.findOne({ user: user._id });
  if (!artist) return null;

  return artist;
}
