import mongoose from "mongoose";

const artistSchema = new mongoose.Schema({
  type: { type:String , default: "Artist"},
  name: { type: String, required: true },
  image: { type: String , default: "/images/notfound.png"}, // image URL
  bgColor :{type: String},
  bio: { type: String ,default : "Don't know much about this artist" },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Song",
    required: true,
  }],
}, { timestamps: true });


export default mongoose.models.Artist || mongoose.model("Artist", artistSchema);



