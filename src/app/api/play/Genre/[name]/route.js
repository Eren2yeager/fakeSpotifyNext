import { connectDB } from "@/lib/mongoose";
import Song from "@/models/Song";

export async function GET(req, { params }) {
  await connectDB();
  const { name } = params || {};
  if (!name) return new Response(JSON.stringify({ error: "Missing genre" }), { status: 400 });
  const regex = new RegExp(`^${name}$`, "i");
  const songs = await Song.find({ genres: { $in: [regex] } })
    .populate("artist", "name image bio  _id")
    .populate("album", "name image _id")
    .lean();
  if (!songs || songs.length === 0) return new Response(JSON.stringify({ error: "No songs for genre" }), { status: 404 });
  return Response.json({ songs, current: songs[0], context: { type: "Genre", id: name, name } });
}


