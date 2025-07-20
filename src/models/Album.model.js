import mongoose from "mongoose";
import Artist from './Artist.model.js'

const albumSchema = new mongoose.Schema({
  type: { type:String , default: "Album"},
  name: { type: String, required: true },
  image: { type: String ,default: "/images/notfound.png" },
  bgColor : {type :String },
  releaseDate: { type: Date },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artist",
    required: true
  }
}, { timestamps: true });

export default  mongoose.models.Album || mongoose.model("Album", albumSchema);
