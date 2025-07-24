import mongoose from "mongoose";
import Song from "./Song";

// Subschema for songs in playlists
const playlistSongSchema = new mongoose.Schema(
  {
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      required: true,
    },
    added: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Playlist subschema
const playlistSchema = new mongoose.Schema(
  { 
    type: { type: String, default: "Playlist" }, // Can be "Playlist" or "Liked"
    specialtype : String,
    name: { type: String, required: true },
    image: { type: String, default: "/images/notfound.png" },
    description: { type: String },
    songs: [playlistSongSchema],
    createdAt: { type: Date, default: Date.now },

  },
  { _id: true }
);

// Main user schema
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, required: true },
    image: String,

    playlists: [playlistSchema], // embedded playlists

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
