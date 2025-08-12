import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Song from "@/models/Song";

export async function GET(req, { params }) {
  await connectDB();
  const { name } =await params || {};
  if (!name) return NextResponse.json({ songs: [] });
  const regex = new RegExp(`^${name}$`, "i");
  const songs = await Song.find({ genres: { $in: [regex] } })
    .populate("artist", "name image bio  _id")
    .populate("album", "name image _id")
    .lean();
  return NextResponse.json({ songs, context: { type: "Genre", id: name, name } });
}


