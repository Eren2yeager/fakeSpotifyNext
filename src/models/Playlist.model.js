import mongoose from "mongoose";
import Song from "./Song.model.js"; // ⬅️ REQUIRED

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

const playlistSchema = new mongoose.Schema(
  {
  type: { type:String , default: "Playlist"},
    name: { type: String, required: true },
    image: { type: String, default: "/images/notfound.png" },
    bgColor: {type:String},
    description: { type: String },
    songs: [playlistSongSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Optional: if you support user accounts
    },
  },
  { timestamps: true }
);

export default mongoose.models.Song ||  mongoose.model("Playlist", playlistSchema);
