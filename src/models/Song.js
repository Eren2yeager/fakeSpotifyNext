import mongoose from "mongoose";
import Artist from "./Artist.js";
import Album from "./Album.js";



const songSchema = new mongoose.Schema(
  {
    type: { type: String, default: "Song" },
    name: { type: String, required: true },
    genres: { type: [String], default: [] },
    image: String,
    duration: { type: String }, // optional, or calculate from file
    fileUrl: { type: String, required: true }, // MP3 or stream URL
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
    },
    views: { type: Number, default: 0 }, // Track number of views/plays
  },
  { timestamps: true }
);

export default mongoose.models.Song || mongoose.model("Song", songSchema);
