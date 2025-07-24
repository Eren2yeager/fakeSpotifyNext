import mongoose from "mongoose";
import fs from "fs";
import Song from "../models/Song.js";
import Artist from "../models/Artist.js";
import Album from "../models/Album.js";



// Connect to MongoDB
await mongoose.connect("mongodb://localhost:27017/clone_spotify");

// Read data from JSON file
const jsonData = JSON.parse(fs.readFileSync("../junks/clone_spotify.songs.json"));

for (let songData of jsonData) {
  const {
    songName,
    artistName,
    albumName,
    duration,
    fileUrl,
    songImageUrl,
    artistImageUrl,
    songBgColor,
    artistBgColor,
  } = songData;

  // 1️⃣ Find or create Artist
  let artist = await Artist.findOne({ name: artistName });
  if (!artist) {
    artist = await Artist.create({
      name: artistName,
      image: artistImageUrl,
      bgColor: artistBgColor,
    });
  }

  // 2️⃣ Find or create Album
  let album = await Album.findOne({ name: albumName, artist: artist._id });
  if (!album) {
    album = await Album.create({
      name: albumName,
      image: songImageUrl,
      artist: artist._id,
    });
  }

  // 3️⃣ Create the Song
  await Song.create({
    name: songName,
    fileUrl,
    image: songImageUrl,
    bgColor : songBgColor,
    duration,
    artist: artist._id,
    album: album._id,
  });

  console.log(`✅ Inserted: ${songName}`);
}

console.log("✅ All songs processed and inserted.");
mongoose.disconnect();
