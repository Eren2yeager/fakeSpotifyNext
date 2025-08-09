import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import Playlist from "@/models/Playlist";
import Artist from "@/models/Artist";
import Album from "@/models/Album";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });

    await connectDB();

    // Fetch the user's library (playlists, artists, albums)
    // Also fetch _id for user to compare with playlist creator
    const user = await User.findOne({ email: session.user.email }).select("_id library");
    if (!user || !user.library) {
      return new Response(
        JSON.stringify({ playlists: [], artists: [], albums: [], all: [] }),
        { status: 200 }
      );
    }

    // --- CLEANUP: Remove private playlists (except for their creator), deleted albums, deleted songs ---

    // 1. Playlists: Remove from user.library.playlists if playlist is now private and user is not the creator, and remove user from playlist.savedBy
    const playlistEntries = user.library.playlists || [];
    const playlistIds = playlistEntries.map((entry) => entry.playlist);
    // Fetch all referenced playlists, including private ones, and their creators
    const allPlaylists = await Playlist.find({ _id: { $in: playlistIds } }).select("_id isPublic savedBy createdBy");
    const playlistIdToDoc = new Map(allPlaylists.map(pl => [pl._id.toString(), pl]));
    let playlistsToRemove = [];
    for (const entry of playlistEntries) {
      const plId = entry.playlist?.toString();
      const playlistDoc = playlistIdToDoc.get(plId);
      // Remove if playlist is missing, or is private and user is not the creator
      if (
        !playlistDoc ||
        (playlistDoc.isPublic === false && String(playlistDoc.createdBy) !== String(user._id))
      ) {
        playlistsToRemove.push(plId);
        // Remove user from playlist.savedBy if playlist exists
        if (playlistDoc && playlistDoc.savedBy?.includes(user._id)) {
          await Playlist.updateOne(
            { _id: playlistDoc._id },
            { $pull: { savedBy: user._id } }
          );
        }
      }
    }
    if (playlistsToRemove.length > 0) {
      await User.updateOne(
        { _id: user._id },
        { $pull: { "library.playlists": { playlist: { $in: playlistsToRemove } } } }
      );
      // Remove from local user object for further processing
      user.library.playlists = user.library.playlists.filter(
        (entry) => !playlistsToRemove.includes(entry.playlist?.toString())
      );
    }

    // 2. Albums: Remove from user.library.albums if album is deleted or its artist is deleted
    const albumEntries = user.library.albums || [];
    const albumIds = albumEntries.map((entry) => entry.album);
    // Fetch all referenced albums, populate artist
    const allAlbums = await Album.find({ _id: { $in: albumIds } }).populate("artist").select("_id artist");
    const albumIdToDoc = new Map(allAlbums.map(al => [al._id.toString(), al]));
    let albumsToRemove = [];
    for (const entry of albumEntries) {
      const alId = entry.album?.toString();
      const albumDoc = albumIdToDoc.get(alId);
      // Remove if album is missing or its artist is missing (deleted)
      if (!albumDoc || !albumDoc.artist) {
        albumsToRemove.push(alId);
      }
    }
    if (albumsToRemove.length > 0) {
      await User.updateOne(
        { _id: user._id },
        { $pull: { "library.albums": { album: { $in: albumsToRemove } } } }
      );
      user.library.albums = user.library.albums.filter(
        (entry) => !albumsToRemove.includes(entry.album?.toString())
      );
    }

    // 3. Songs: Remove from user.library.songs if song is deleted
    // (Assuming user.library.songs exists and is an array of { song, added } objects)
    if (user.library.songs && Array.isArray(user.library.songs) && user.library.songs.length > 0) {
      const songIds = user.library.songs.map((entry) => entry.song);
      // Dynamically import Song model to avoid circular dependency if needed
      let Song;
      try {
        Song = (await import("@/models/Song")).default;
      } catch (e) {
        Song = null;
      }
      if (Song) {
        const allSongs = await Song.find({ _id: { $in: songIds } }).select("_id");
        const validSongIds = new Set(allSongs.map(s => s._id.toString()));
        const songsToRemove = user.library.songs
          .filter(entry => !validSongIds.has(entry.song?.toString()))
          .map(entry => entry.song?.toString());
        if (songsToRemove.length > 0) {
          await User.updateOne(
            { _id: user._id },
            { $pull: { "library.songs": { song: { $in: songsToRemove } } } }
          );
          user.library.songs = user.library.songs.filter(
            (entry) => !songsToRemove.includes(entry.song?.toString())
          );
        }
      }
    }

    // Helper to fetch and order documents by the sequence of their ObjectIds in the library
    async function fetchAndOrder(model, entries, refKey, populate = null) {
      if (!Array.isArray(entries) || entries.length === 0) return [];
      const ids = entries.map((entry) => entry[refKey]);
      let query = model.find({ _id: { $in: ids } });
      if (populate) {
        query = query.populate(populate);
      }
      const docs = await query.lean();
      const docsMap = new Map(docs.map((doc) => [doc._id.toString(), doc]));
      // Order by the sequence in the user's library
      return ids.map((id) => docsMap.get(id.toString())).filter(Boolean);
    }

    // Playlists (include public playlists and private playlists only if user is the creator)
    // We need to filter playlists accordingly
    const playlists = await Playlist.find({
      _id: { $in: (user.library.playlists || []).map((entry) => entry.playlist) }
    })
      .populate({
        path: "songs.song",
        populate: [
          { path: "artist", select: "name image bio type type" },
          { path: "album", select: "name image" },
        ],
      })
      .populate({ path: "createdBy", select: "_id name " })
      .lean();

    // Only include playlists that are public, or private but created by the user
    const filteredPlaylists = playlists.filter(
      (pl) =>
        pl.isPublic === true ||
        (pl.isPublic === false && String(pl.createdBy?._id || pl.createdBy) === String(user._id))
    );

    const playlistMap = new Map(filteredPlaylists.map((pl) => [pl._id.toString(), pl]));
    const orderedPlaylists = (user.library.playlists || [])
      .map((entry) => playlistMap.get(entry.playlist.toString()))
      .filter(Boolean);

    // Artists
    const orderedArtists = await fetchAndOrder(
      Artist,
      user.library.artists || [],
      "artist"
    );

    // Albums (populate the artist field)
    const orderedAlbums = await fetchAndOrder(
      Album,
      user.library.albums || [],
      "album",
      { path: "artist", select: "name image bio type" }
    );

    // Songs (optional: fetch and order if you want to return them)
    let orderedSongs = [];
    if (user.library.songs && Array.isArray(user.library.songs) && user.library.songs.length > 0) {
      let Song;
      try {
        Song = (await import("@/models/Song")).default;
      } catch (e) {
        Song = null;
      }
      if (Song) {
        orderedSongs = await fetchAndOrder(
          Song,
          user.library.songs,
          "song",
          [
            { path: "artist", select: "name image bio type" },
            { path: "album", select: "name image" }
          ]
        );
      }
    }

    // Compose the "all" array in the order of their "added" sequence in the user's library
    // Each entry in the user's library has a type: playlist, artist, album, or song
    const all = [];
    // Create lookup maps for fast access
    const playlistObjMap = new Map(orderedPlaylists.map(obj => [obj._id.toString(), obj]));
    const artistObjMap = new Map(orderedArtists.map(obj => [obj._id.toString(), obj]));
    const albumObjMap = new Map(orderedAlbums.map(obj => [obj._id.toString(), obj]));
    const songObjMap = new Map(orderedSongs.map(obj => [obj._id.toString(), obj]));

    // Merge all entries in the order they were added
    const combinedEntries = [];

    (user.library.playlists || []).forEach(entry => {
      combinedEntries.push({
        type: "playlist",
        id: entry.playlist?.toString(),
        added: entry.added,
      });
    });
    (user.library.artists || []).forEach(entry => {
      combinedEntries.push({
        type: "artist",
        id: entry.artist?.toString(),
        added: entry.added,
      });
    });
    (user.library.albums || []).forEach(entry => {
      combinedEntries.push({
        type: "album",
        id: entry.album?.toString(),
        added: entry.added,
      });
    });
    (user.library.songs || []).forEach(entry => {
      combinedEntries.push({
        type: "song",
        id: entry.song?.toString(),
        added: entry.added,
      });
    });

    // Sort by added date if present, otherwise keep original order
    combinedEntries.sort((a, b) => {
      if (a.added && b.added) {
        return new Date(a.added) - new Date(b.added);
      }
      return 0;
    });

    // Map to the actual objects, tagging with type
    for (const entry of combinedEntries) {
      if (entry.type === "playlist" && playlistObjMap.has(entry.id)) {
        all.push({ type: "playlist", ...playlistObjMap.get(entry.id) });
      } else if (entry.type === "artist" && artistObjMap.has(entry.id)) {
        all.push({ type: "artist", ...artistObjMap.get(entry.id) });
      } else if (entry.type === "album" && albumObjMap.has(entry.id)) {
        all.push({ type: "album", ...albumObjMap.get(entry.id) });
      } else if (entry.type === "song" && songObjMap.has(entry.id)) {
        all.push({ type: "song", ...songObjMap.get(entry.id) });
      }
    }

    // Compose the response in the order of their "added" sequence in the user's library
    return Response.json({
      playlists: orderedPlaylists,
      artists: orderedArtists,
      albums: orderedAlbums,
      songs: orderedSongs,
      all,
    });
  } catch (error) {
    console.error("❌ Failed to fetch user library:", error);
    return new Response("Server Error", { status: 500 });
  }
}