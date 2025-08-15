"use client";
import React from "react";
import { useEffect } from "react";
import { usePlayer } from "@/Contexts/playerContext";
import { useTitleManager } from "@/Components/Helper/useTitleManager";

function SearchLayout({ children }) {
  const { currentSong, isPlaying } = usePlayer();
  const { setPageTitle } = useTitleManager("Search - Fake Spotify", currentSong, isPlaying);

  useEffect(() => {
    // Set page title only if no song is playing
    setPageTitle("Search - Fake Spotify");
  }, [setPageTitle]);

  return <>{children}</>;
}

export default React.memo(SearchLayout);
