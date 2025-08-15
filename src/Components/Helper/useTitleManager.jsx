"use client";
import { useEffect, useRef } from "react";

/**
 * Custom hook to manage page titles with priority for currently playing songs
 * @param {string} defaultTitle - The default title for the page
 * @param {Object} currentSong - The currently playing song object
 * @param {boolean} isPlaying - Whether a song is currently playing
 */
export const useTitleManager = (defaultTitle, currentSong, isPlaying) => {
  const previousTitleRef = useRef(defaultTitle);
  const isSongPlayingRef = useRef(false);

  useEffect(() => {
    // Check if a song is currently playing
    const hasSongPlaying = currentSong && isPlaying;
    isSongPlayingRef.current = hasSongPlaying;

    if (hasSongPlaying && currentSong.name) {
      // If a song is playing, set title to song name
      const songTitle = `${currentSong.name} - Fake Spotify`;
      document.title = songTitle;
      previousTitleRef.current = songTitle;
    } else if (!hasSongPlaying) {
      // If no song is playing, set to default title
      document.title = defaultTitle;
      previousTitleRef.current = defaultTitle;
    }
  }, [currentSong, isPlaying, defaultTitle]);

  // Function to temporarily override title (for page-specific titles)
  const setPageTitle = (pageTitle) => {
    // Only set page title if no song is currently playing
    if (!isSongPlayingRef.current) {
      document.title = pageTitle;
      previousTitleRef.current = pageTitle;
    }
  };

  // Function to restore the appropriate title
  const restoreTitle = () => {
    if (isSongPlayingRef.current && currentSong?.name) {
      document.title = `${currentSong.name} - Fake Spotify`;
    } else {
      document.title = defaultTitle;
    }
  };

  return { setPageTitle, restoreTitle };
};
