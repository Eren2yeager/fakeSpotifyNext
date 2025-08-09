import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Song from "@/models/Song";

export async function POST(req) {
  await connectDB();
  
  try {
    const { songIds } = await req.json();
    
    if (!songIds || !Array.isArray(songIds)) {
      return NextResponse.json({ error: "Invalid songIds" }, { status: 400 });
    }

    const songs = await Song.find({ _id: { $in: songIds } })
      .populate("artist", "name _id")
      .populate("album", "name _id")
      .lean();

    return NextResponse.json({ songs });
  } catch (error) {
    console.error("Bulk song fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch songs" }, { status: 500 });
  }
}
