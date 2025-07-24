import mongoose from "mongoose";
import Playlist from "../models/Playlist.js";
import Song from "../models/Song.js";

await mongoose.connect("mongodb://localhost:27017/clone_spotify");

// Get first 10 songs
const songs = await Song.find().limit(10);
if (songs.length === 0) {
  console.error("⚠️ No songs found!");
  process.exit();
}

// Define playlists
const playlists = [
  {
    name: "Lo-Fi Chill",
    description: "Relaxing tracks for background vibes.",
    songIds: songs.slice(0, 2).map(s => s._id)
  },
  {
    name: "Hype Workout",
    description: "Energetic songs to get you pumped.",
    songIds: songs.slice(2, songs.length).map(s => s._id)
  }
];

// Create playlists and update songs' savedIn field
for (const p of playlists) {
  const newPlaylist = await Playlist.create({
    name: p.name,
    description: p.description,
    songs: [] // start empty
  });

  for (const songId of p.songIds) {
    // ✅ Add song to playlist if not already present
    await Playlist.updateOne(
      { _id: newPlaylist._id },
      { $addToSet: { songs: {song : songId}  } }
    );

    // ✅ Add playlist to song's savedIn if not already there
    await Song.updateOne(
      { _id: songId },
      { $addToSet: { savedIn: newPlaylist._id } }
    );
  }

  console.log(`✅ Created playlist: ${p.name}`);
}

mongoose.disconnect();
