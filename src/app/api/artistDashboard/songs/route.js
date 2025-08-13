
import { connectDB } from "@/lib/mongoose";
import Song from "@/models/Song";
import Artist from "@/models/Artist";
import { uploadToCloudinary } from "@/lib/cloudinary";
import formatTime from "@/functions/formatTime";
export async function GET() {
  const artist = await getArtistFromSession();
  if (!artist) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const songs = await Song.find({ artist: artist._id }).populate("album");

  return Response.json(songs);
}
// ___________________________________________________________________________________________________________________________________________
//  to create new song
export async function POST(req) {
  try {
    const artist = await getArtistFromSession();
    if (!artist) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    await connectDB();
    const name = formData.get("name");
    // Accept multiple genres via repeated form fields
    const genres = formData.getAll("genres").map((g) => String(g).trim()).filter(Boolean);
    const image = formData.get("image");
    const audioFile = formData.get("audioFile");

    // Basic validation for required fields
    if (!name || genres.length === 0 || !image || !audioFile) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check that image and audioFile are File/Blob objects
    if (
      typeof image !== "object" ||
      typeof audioFile !== "object" ||
      typeof image.arrayBuffer !== "function" ||
      typeof audioFile.arrayBuffer !== "function"
    ) {
      return Response.json({ error: "Invalid file uploads" }, { status: 400 });
    }

    // Optional: check file size/type (example: max 20MB audio, 5MB image)
    const maxImageSize = 5 * 1024 * 1024;
    const maxAudioSize = 20 * 1024 * 1024;
    if (image.size > maxImageSize) {
      return Response.json({ error: "Image file too large" }, { status: 413 });
    }
    if (audioFile.size > maxAudioSize) {
      return Response.json({ error: "Audio file too large" }, { status: 413 });
    }

    // Only get arrayBuffers once
    const [imageBuffer, audioBuffer] = await Promise.all([
      image.arrayBuffer(),
      audioFile.arrayBuffer(),
    ]);

    // Get duration of audio file
    let duration = null;
    try {
      const mm = await import("music-metadata");
      const { format } = await mm.parseBuffer(
        Buffer.from(audioBuffer),
        audioFile.type
      );
      duration = formatTime(format.duration); // duration in mm:ss
    } catch (err) {
      return Response.json(
        { error: "Failed to parse audio metadata" },
        { status: 422 }
      );
    }

    // Upload files to Cloudinary
    let image_secure_url, audio_secure_url;
    try {
      image_secure_url = await uploadToCloudinary(
        Buffer.from(imageBuffer),
        "spotify/songs/images",
        "image"
      );
      // Cloudinary expects "video" resource type for audio files
      audio_secure_url = await uploadToCloudinary(
        Buffer.from(audioBuffer),
        "spotify/songs/audios",
        "video"
      );
    } catch (err) {
      return Response.json({ error: "File upload failed" }, { status: 500 });
    }

    // Create song in DB
    let song;
    try {
      song = await Song.create({
        artist: artist._id,
        name: name,
        genres: genres,
        image: image_secure_url,
        fileUrl: audio_secure_url,
        duration: duration,
      });

      artist.songs.push(song._id);
      await artist.save();
    } catch (err) {
      return Response.json({ error: "Failed to create song" }, { status: 500 });
    }

    // Optionally, avoid logging sensitive info in production


    return new Response(JSON.stringify({ message: true, song: song }), {
      status: 200,
    });
  } catch (err) {
    // Catch-all for unexpected errors
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ___________________________________________________________________________________________________________________________________________
// to update a song
export async function PUT(req) {
  const artist = await getArtistFromSession();
  if (!artist) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const id = formData.get("id");
  const name = formData.get("name");
  const genres = formData.getAll("genres").map((g) => String(g).trim()).filter(Boolean);
  const image = formData.get("image");

  await connectDB();

  // Build update object only with provided fields
  const update = {};
  if (name !== undefined && name !== null) update.name = name;
  if (genres && genres.length > 0) update.genres = genres;

  // Handle image upload from file input
  if (image && typeof image === "object" && image.arrayBuffer) {
    // If image is a File object from input[type=file]
    const buffer = Buffer.from(await image.arrayBuffer());
    const image_secure_url = await uploadToCloudinary(
      buffer,
      "spotify/songs/images",
      "image"
    );
    update.image = image_secure_url;
  }

  // If no fields to update, return error
  if (Object.keys(update).length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 });
  }

  const song = await Song.findOneAndUpdate(
    { _id: id, artist: artist._id },
    update,
    { new: true }
  );

  if (!song) return Response.json({ error: "Song not found" }, { status: 404 });

  return new Response(JSON.stringify({ success: true, song }), { status: 200 });
}



// ___________________________________________________________________________________________________________________________________________
// to delete a song
export async function DELETE(req) {
  const artist = await getArtistFromSession();
  if (!artist) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const id = formData.get("id");
  await connectDB();
  const deleted = await Song.findOneAndDelete({
    _id: id,
    artist: artist._id,
  });

  if (!deleted)
    return Response.json({ error: "Song not found" }, { status: 404 });
  // Remove the song id from the artist.songs array as well
  if (deleted) {
    await Artist.updateOne({ _id: artist._id }, { $pull: { songs: id } });
  }

  return Response.json({ success: true });
}
