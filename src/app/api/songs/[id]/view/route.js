import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import Song from "@/models/Song";

// Increment a song's view count when it is played
export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = await params || {};
    if (!id) {
      return NextResponse.json({ error: "Missing song id" }, { status: 400 });
    }

    const updated = await Song.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true, select: "views _id" }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, views: updated.views, id: updated._id });
  } catch (err) {
    console.error("Failed to increment song views:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


