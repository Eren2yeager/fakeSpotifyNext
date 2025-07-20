import mongoose from "mongoose";
import Artist from "./Artist.model.js";
import Album from "./Album.model.js";
import Playlist from "./Playlist.model.js";



const songSchema = new mongoose.Schema(
  {
    type: { type:String , default: "Song"},
    name: { type: String, required: true },
    duration: { type: String }, // optional, or calculate from file
    image: { type: String, default: "/images/notfound.png" },
    bgColor :{type: String},
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
    savedIn: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Playlist'
    }]
  },
  { timestamps: true }
);

export default mongoose.models.Song || mongoose.model("Song", songSchema);
