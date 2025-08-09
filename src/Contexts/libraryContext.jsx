// context/PlaylistContext.js
import { createContext, useContext, useState } from "react";

const ContextLibrary = createContext();

export const useLibrary = () => useContext(ContextLibrary);

export const LibraryProvider = ({ children }) => {
  const [library, setLibrary] = useState(null);

  // Hook to fertch songs
  const fetchLibrary = () => {
    fetch("/api/library")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch library");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data)
        setLibrary(data);
        return data;
      })
      .catch((err) => {
        console.error("❌ Error fetching library:", err);
        return null;
      });
  };
  // ________________________________________________
  //   to check if a song is in any playlist
  const getKeeperPlaylists = (song_id) => {
    if (library) {
      const keeperPlaylists = library?.playlists.filter((playlist) => {
        // Check if the playlist has songs and is an array
        if (Array.isArray(playlist.songs) && playlist.songs.length > 0) {
          // Check if the song_id exists in the playlist's songs
          // an extran key to give checkbox helping
          playlist.contains = playlist.songs.some(
            (songData) => songData.song?._id === song_id
          );
          return playlist.contains;
        }
        return false; // Return false if there are no songs
      });
      return keeperPlaylists; // Return the filtered library
    }
    return null; // Return null if library is not defined
  };

  const getNonKeeperPlaylists = (song_id) => {
    if (library) {
      const nonKeeperPlaylists = library?.playlists.filter((playlist) => {
        // Check if the playlist has songs and is an array
        if (Array.isArray(playlist.songs) && playlist.songs.length > 0) {
          // Check if the song_id does not exist in the playlist's songs
          playlist.contains = !playlist.songs.some(
            (songData) => songData.song?._id === song_id
          );
          return playlist.contains;
        }
        return true; // Return true if there are no songs, meaning the playlist is included
      });
      return nonKeeperPlaylists; // Return the filtered library
    }
    return null; // Return null if library is not defined
  };
  // Returns all library, each with a 'contains' key indicating if the song is present
  const getPlaylistsWithContainKeyForSong = (song_id) => {
    if (library) {
      return library?.playlists.map((playlist) => ({
        ...playlist,
        contains: Array.isArray(playlist.songs)
          ? playlist.songs.some((songData) => songData.song?._id === song_id)
          : false,
      }));
    }
    return null;
  };

  const checkSongInPlaylist = (song_id, playlist_id) => {
    // Check if library are available
    if (library) {
      // Find the specific playlist by its ID
      const playlist = library?.playlists.find((pl) => pl._id === playlist_id);

      // If the playlist is found and has songs
      if (
        playlist?.playlists &&
        Array.isArray(playlist.songs) &&
        playlist.songs.length > 0
      ) {
        // Check if the song_id exists in the playlist's songs
        return playlist.songs.some((songData) => songData.song._id === song_id);
      }
    }
    return false; // Return false if the playlist is not found or has no songs
  };
  const checkSongIsInLikedSongs = (song_id) => {
    // Check if library are available
    if (library) {
      // Find the specific playlist by its ID
      const playlist = library?.playlists.find((pl) => pl.specialtype === "Liked");

      // If the playlist is found and has songs
      if (
        playlist?.playlists &&
        Array.isArray(playlist.songs) &&
        playlist.songs.length > 0
      ) {
        // Check if the song_id exists in the playlist's songs
        return playlist.songs.some((songData) => songData.song._id === song_id);
      }
    }
    return false; // Return false if the playlist is not found or has no songs
  };

  const checkPlaylistExistsById = (playlist_id) => {
    if (library && Array.isArray(library.playlists)) {
      return library.playlists.some((pl) => pl._id === playlist_id);
    }
    return false;
  };

  return (
    <ContextLibrary.Provider
      value={{
        library,
        setLibrary,
        fetchLibrary,
        getKeeperPlaylists,
        getNonKeeperPlaylists,
        checkSongInPlaylist,
        checkSongIsInLikedSongs,
        getPlaylistsWithContainKeyForSong,
        checkPlaylistExistsById
      }}
    >
      {children}
    </ContextLibrary.Provider>
  );
};
