import mongoose from "mongoose";
import Song from "./Song.js"; // ⬅️ REQUIRED

// 👇 Subdocument schema
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
); // optional: avoid _id for each subdoc

// Playlist subschema
const playlistSchema = new mongoose.Schema(
    {
      type: { type: String, default: "Playlist" }, // Can be "Playlist" or "Liked"
      specialtype: String,
      name: { type: String, required: true },
      image: { type: String, default: "/images/notfound.png" },
      description: { type: String },
      songs: [playlistSongSchema],
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Optional: if you support user accounts
      },
      isPublic: { type: Boolean, default: false },
      savedBy: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Optional: if you support user accounts
        }
      ],
      createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
  );

export default mongoose.models.Playlist ||  mongoose.model("Playlist", playlistSchema);
