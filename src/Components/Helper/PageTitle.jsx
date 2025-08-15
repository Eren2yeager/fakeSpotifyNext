"use client";
import { useEffect } from "react";
import { usePlayer } from "@/Contexts/playerContext";
import { useTitleManager } from "./useTitleManager";

/**
 * Component for setting page-specific titles that respect currently playing songs
 * @param {string} title - The page title to set
 * @param {string} defaultTitle - The default title if no specific title is provided
 */
export const PageTitle = ({ title, defaultTitle = "Fake Spotify" }) => {
  const { currentSong, isPlaying } = usePlayer();
  const { setPageTitle } = useTitleManager(defaultTitle, currentSong, isPlaying);

  useEffect(() => {
    if (title) {
      setPageTitle(title);
    }
  }, [title, setPageTitle]);

  return null; // This component doesn't render anything
};
