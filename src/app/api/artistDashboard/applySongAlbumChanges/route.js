import Song from "@/models/Song"; 
import { getArtistFromSession } from "@/app/(protected)/actions/artistActions";
import Artist from "@/models/Artist";
import { connectDB } from "@/lib/mongoose";
import Album from "@/models/Album";
// to add songs to an album
export async function POST(req) {
    const artist = await getArtistFromSession();
    if (!artist) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { albumId, songIds } = await req.json(); // Expecting { albumId, songIds }

    await connectDB();

    // Check if all songIds belong to the artist
    const songs = await Song.find({ _id: { $in: songIds }, artist: artist._id });
    if (songs.length !== songIds.length) {
        return Response.json({ error: "One or more songs do not belong to the artist" }, { status: 403 });
    }

    // Find the album and ensure it belongs to the artist
    const album = await Album.findOne({ _id: albumId, artist: artist._id });
    if (!album) {
        return Response.json({ error: "Album not found or does not belong to the artist" }, { status: 404 });
    }

    // Add songIds to album.songs, avoiding duplicates
    const currentSongIds = album.songs.map(s => s.toString());
    const newSongIds = songIds.filter(id => !currentSongIds.includes(id.toString()));
    album.songs.push(...newSongIds);

    // Update each song's album field
    await Song.updateMany(
        { _id: { $in: newSongIds } },
        { album: albumId }
    );

    await album.save();

    return Response.json({ success: true, addedCount: newSongIds.length });
}