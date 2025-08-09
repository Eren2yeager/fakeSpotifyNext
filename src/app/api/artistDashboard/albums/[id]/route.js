import { getArtistFromSession } from "@/app/(protected)/actions/artistActions";
import { connectDB } from "@/lib/mongoose";
import Album from "@/models/Album";

export async function GET(req, { params }) {
  try {
    const artist = await getArtistFromSession();
    if (!artist) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const album = await Album.findOne({ _id: id, artist: artist._id }).populate("songs").populate("artist");

    if (!album) {
      return Response.json({ error: "Album not found or access denied" }, { status: 404 });
    }

    return Response.json(album);
  } catch (error) {
    return Response.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}

// to delete an album
export async function DELETE(req, { params }) {
  try {
    const artist = await getArtistFromSession();
    if (!artist) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Parse form data
    const formData = await req.formData();
    const songId = formData.get("songId");

    if (!songId) {
      return Response.json({ error: "Missing songId" }, { status: 400 });
    }

    // Get albumId from params
    const { id } = await params;
    const albumId = id;

    // Find the album and ensure it belongs to the artist
    const album = await Album.findOne({ _id: albumId, artist: artist._id });
    if (!album) {
      return Response.json({ error: "Album not found or access denied" }, { status: 404 });
    }

    // Remove the song from album.songs
    album.songs = album.songs.filter(
      (id) => id.toString() !== songId.toString()
    );
    await album.save();

    // Remove the album from the song's album field
    const Song = (await import('@/models/Song')).default;
    const song = await Song.findOne({ _id: songId, artist: artist._id });
    if (song) {
      song.album = undefined;
      await song.save();
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
