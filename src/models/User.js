import mongoose from "mongoose";
import Artist from "./Artist.js";
import Playlist from "./Playlist.js";
import Album from "./Album.js";

// Main user schema
const userSchema = new mongoose.Schema(
  {
    type: { type: String, default: "Profile" },
    name: String,
    email: { type: String, unique: true, required: true },
    image: String,
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
    isArtist: { type: Boolean, default: false }, // Optional, purely for UI checks
    // Spotify-like library: separate arrays for playlists, albums, and artists, each with timestamps
    library: {
      playlists: [
        {
          playlist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Playlist",
            required: true,
          },
          added: { type: Date, default: Date.now },
        },
      ],
      albums: [
        {
          album: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Album",
            required: true,
          },
          added: { type: Date, default: Date.now },
        },
      ],
      artists: [
        {
          artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist",
            required: true,
          },
          added: { type: Date, default: Date.now },
        },
      ],
    },
    followers: {
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      artists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artist" }],
    },
    following: {
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      artists: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artist" }],
    },

    // Inside userSchema definition (add below existing fields)
    playbackState: {
      currentSong: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
      context: {
        type: { type: String, enum: ["Song", "Album", "Playlist", "Artist"] },
        id: { type: mongoose.Schema.Types.ObjectId }, // refPath too dynamic; we store raw id
        name: String,
      },
      originalQueue: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
      playOrder: [Number],
      currentPlayOrderIndex: { type: Number, default: 0 },
      userInsertQueue: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" }],
      isShuffling: { type: Boolean, default: false },
      repeatMode: { type: String, enum: ["off", "all", "one"], default: "off" },
      autoplayEnabled: { type: Boolean, default: true },
      // positionSec removed; using ephemeral currentTimeRef only client-side
      updatedAt: { type: Date, default: Date.now },
    },
    recents: {
      songs: [
        {
          song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
          playedAt: { type: Date, default: Date.now },
        },
      ],
      albums: [
        {
          album: { type: mongoose.Schema.Types.ObjectId, ref: "Album" },
          playedAt: { type: Date, default: Date.now },
          songs: [
            {
              song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
              playedAt: { type: Date, default: Date.now },
            },
          ],
        },
      ],
      playlists: [
        {
          playlist: { type: mongoose.Schema.Types.ObjectId, ref: "Playlist" },
          playedAt: { type: Date, default: Date.now },
          songs: [
            {
              song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
              playedAt: { type: Date, default: Date.now },
            },
          ],
        },
      ],
      artists: [
        {
          artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
          playedAt: { type: Date, default: Date.now },
          songs: [
            {
              song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
              playedAt: { type: Date, default: Date.now },
            },
          ],
        },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
