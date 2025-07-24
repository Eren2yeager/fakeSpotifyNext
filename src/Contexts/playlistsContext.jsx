// context/PlaylistContext.js
import { createContext, useContext, useState } from "react";

const ContextPlaylists = createContext();

export const usePlaylists = () => useContext(ContextPlaylists);

export const PlaylistsProvider = ({ children }) => {
  const [playlists, setPlaylists] = useState(null);

  // Hook to fertch songs
  const fetchPlaylists = () => {
    fetch("/api/playlists")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch playlists");
        }
        return res.json();
      })
      .then((data) => {
        setPlaylists(data);
        return data;
      })
      .catch((err) => {
        console.error("❌ Error fetching playlists:", err);
        return null;
      });
  };
  // ________________________________________________
  //   to check if a song is in any playlist
  const getKeeperPlaylists = (song_id) => {
    if (playlists) {
      const keeperPlaylists = playlists.filter((playlist) => {
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
      return keeperPlaylists; // Return the filtered playlists
    }
    return null; // Return null if playlists is not defined
  };

  const getNonKeeperPlaylists = (song_id) => {
    if (playlists) {
      const nonKeeperPlaylists = playlists.filter((playlist) => {
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
      return nonKeeperPlaylists; // Return the filtered playlists
    }
    return null; // Return null if playlists is not defined
  };
  // Returns all playlists, each with a 'contains' key indicating if the song is present
  const getPlaylistsWithContainKeyForSong = (song_id) => {
    if (playlists) {
      return playlists.map((playlist) => ({
        ...playlist,
        contains: Array.isArray(playlist.songs)
          ? playlist.songs.some((songData) => songData.song?._id === song_id)
          : false,
      }));
    }
    return null;
  };

  const checkSongInPlaylist = (song_id, playlist_id) => {
    // Check if playlists are available
    if (playlists) {
      // Find the specific playlist by its ID
      const playlist = playlists.find((pl) => pl._id === playlist_id);

      // If the playlist is found and has songs
      if (
        playlist &&
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
    // Check if playlists are available
    if (playlists) {
      // Find the specific playlist by its ID
      const playlist = playlists.find((pl) => pl.specialtype === "Liked");

      // If the playlist is found and has songs
      if (
        playlist &&
        Array.isArray(playlist.songs) &&
        playlist.songs.length > 0
      ) {
        // Check if the song_id exists in the playlist's songs
        return playlist.songs.some((songData) => songData.song._id === song_id);
      }
    }
    return false; // Return false if the playlist is not found or has no songs
  };

  return (
    <ContextPlaylists.Provider
      value={{
        playlists,
        setPlaylists,
        fetchPlaylists,
        getKeeperPlaylists,
        getNonKeeperPlaylists,
        checkSongInPlaylist,
        checkSongIsInLikedSongs,
        getPlaylistsWithContainKeyForSong
      }}
    >
      {children}
    </ContextPlaylists.Provider>
  );
};
