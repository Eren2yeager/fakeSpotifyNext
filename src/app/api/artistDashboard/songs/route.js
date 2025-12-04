
import { connectDB } from "@/lib/mongoose";
import Song from "@/models/Song";
import Artist from "@/models/Artist";
import { uploadToCloudinary } from "@/lib/cloudinary";
import formatTime from "@/functions/formatTime";
import { getArtistFromSession } from "@/app/(protected)/actions/artistActions";
import parseLRC from "@/functions/lyricsParser";
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
    const lrcFile = formData.get("lrcFile");

    let lyrics = [];
    if (lrcFile) {
      const lrcText = await lrcFile.text();
      lyrics = parseLRC(lrcText);
    }

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

    // Restrict audio file size (max 50MB to match Next.js config)
    // Cloudinary free tier supports up to 100MB files
    const maxAudioSize = 50 * 1024 * 1024; // 50MB
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    
    if (audioFile.size > maxAudioSize) {
      return Response.json({ 
        error: `Audio file too large (max 50MB allowed, got ${(audioFile.size / 1024 / 1024).toFixed(2)}MB)` 
      }, { status: 413 });
    }
    
    if (image.size > maxImageSize) {
      return Response.json({ 
        error: `Image file too large (max 10MB allowed, got ${(image.size / 1024 / 1024).toFixed(2)}MB)` 
      }, { status: 413 });
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
      console.log(`Uploading image (${(image.size / 1024 / 1024).toFixed(2)}MB)...`);
      image_secure_url = await uploadToCloudinary(
        Buffer.from(imageBuffer),
        "spotify/songs/images",
        "image"
      );
      console.log("Image uploaded successfully");
      
      console.log(`Uploading audio (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)...`);
      // Cloudinary expects "video" resource type for audio files
      audio_secure_url = await uploadToCloudinary(
        Buffer.from(audioBuffer),
        "spotify/songs/audios",
        "video"
      );
      console.log("Audio uploaded successfully");
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return Response.json({ 
        error: `File upload failed: ${err.message}` 
      }, { status: 500 });
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
        lyrics: lyrics,
        duration: duration,
      });

      artist.songs.push(song._id);
      await artist.save();
    } catch (err) {
      return Response.json({ error: "Failed to create song" }, { status: 500 });
    }

    return new Response(JSON.stringify({ message: true, song: song }), {
      status: 200,
    });
  } catch (err) {
    // // Catch-all for unexpected errors
    // // If the error is related to request size, add a hint for the client
    if (
      err &&
      typeof err.message === "string" &&
      err.message.toLowerCase().includes("body exceeded") // e.g. "Request body size limit exceeded"
    ) {
      return Response.json({
        error:
          "Upload failed: File too large for server to accept. Try a smaller file or check your network/server limits.",
      }, { status: 413 });
    }
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
  const lrcFile = formData.get("lrcFile");

  await connectDB();

  // Build update object only with provided fields
  const update = {};
  
  let lyrics = [];
  if (lrcFile) {
    const lrcText = await lrcFile.text();
    lyrics = parseLRC(lrcText);
  }
 if( lyrics.length !==0 ) update.lyrics = lyrics;
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
