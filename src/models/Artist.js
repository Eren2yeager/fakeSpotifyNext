// models/Artist.js
import mongoose from "mongoose";
import Song from "./Song.js";
import Album from "./Album.js";
import User
 from "./User.js";
const artistSchema = new mongoose.Schema({
  type: { type:String , default: "Artist"},
  specialtype: { type:String , default: "Artist"},
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User",},
  name: { type: String, required: true },
  image: String,
  bio: String,
  albums: [{ type: mongoose.Schema.Types.ObjectId, ref: "Album" }],
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
  followers: {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    artists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artist" }]
  },
  following: {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    artists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artist" }]
  },
}, { timestamps: true });

export default mongoose.models.Artist || mongoose.model("Artist", artistSchema);
