import { connectDB } from "@/lib/mongoose";
import Album from "@/models/Album";

export async function GET(req, { params }) {
  try {


    const { id } = await params;
    await connectDB();
    const album = await Album.findOne({ _id: id })
      .populate({
        path: "songs",
        populate: [
          { path: "artist"},
          { path: "album", select: "_id" }
        ]
      })
      .populate("artist");

    if (!album) {
      return Response.json({ error: "Album not found " }, { status: 404 });
    }

    return Response.json(album);
  } catch (error) {
    return Response.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
