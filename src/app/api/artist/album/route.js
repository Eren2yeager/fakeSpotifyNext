import { getArtistFromSession } from "@/app/(protected)/actions/artistActions";
import { connectDB } from "@/lib/mongoose";
import Album from "@/models/Album";


export async function GET() {
  const artist = await getArtistFromSession();
  if (!artist) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const albums = await Album.find({ artist: artist._id }).populate("songs");

  return Response.json(albums);
}




export async function POST(req) {
  const artist = await getArtistFromSession();
  if (!artist) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json(); // { title, image }

  await connectDB();
  const album = await Album.create({
    ...body,
    artist: artist._id,
  });

  return Response.json(album);
}




export async function PUT(req) {
  const artist = await getArtistFromSession();
  if (!artist) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json(); // { id, title, image }

  await connectDB();
  const album = await Album.findOneAndUpdate(
    { _id: body.id, artist: artist._id },
    { ...body },
    { new: true }
  );

  if (!album) return Response.json({ error: "Album not found" }, { status: 404 });

  return Response.json(album);
}




export async function DELETE(req) {
  const artist = await getArtistFromSession();
  if (!artist) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json(); // { id }

  await connectDB();
  const deleted = await Album.findOneAndDelete({ _id: body.id, artist: artist._id });

  if (!deleted) return Response.json({ error: "Album not found" }, { status: 404 });

  return Response.json({ success: true });
}
