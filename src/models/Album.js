import mongoose from "mongoose";
import Artist from './Artist.js'
import Song from "./Song.js";
const albumSchema = new mongoose.Schema({
  type: { type:String , default: "Album"},
  specialtype: { type:String , default: "Album"},
  name: { type: String, required: true },
  description: { type: String},
  image: { type: String ,default: "/images/notfound.png" },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artist",
    required: true
  },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  releaseDate: { type: Date , default: Date.now },

}, { timestamps: true });

export default  mongoose.models.Album || mongoose.model("Album", albumSchema);
