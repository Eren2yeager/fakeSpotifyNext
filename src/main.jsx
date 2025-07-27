"use client";
import { useRef, useState, useEffect, useContext } from "react";
import {
  ToggleFullScreenContext,
  audioRefContext,
  showRightContext,
  isPlayingContext,
  imagePreviewContext,
  showPlaylistsContext,
  middleWidthContex,
} from "./Contexts/contexts.js";
import {
  currentTimeContext,
  durationContext,
} from "@/Contexts/audio.controls..js";
import { PlayerProvider } from "@/Contexts/playerContext.jsx";

import { GLOWAL_SEARCH_TEXT_CONTEXT } from "@/Contexts/search.controls.js";
import { PlaylistsProvider } from "./Contexts/playlistsContext.jsx";
import { SpotifyToastProvider } from "./Contexts/SpotifyToastContext.jsx";
import { UserProvider } from "./Contexts/userContex.jsx";
const BodyToRender = ({ children }) => {
  const [toggleFullScreen, settoggleFullScreen] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [isPlaying, setisPlaying] = useState(false);
  const ContextAudioRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [src, setSrc] = useState(null);
  const [middleWidth, setMiddleWidth] = useState(0);

  // for Glowal_search_text
  const [searchedText, setSearchedText] = useState("");

  return (
    <SpotifyToastProvider>
      <UserProvider>
        <audioRefContext.Provider value={ContextAudioRef}>
          <isPlayingContext.Provider value={{ isPlaying, setisPlaying }}>
            <PlayerProvider>
              <PlaylistsProvider>
                <ToggleFullScreenContext.Provider
                  value={{ toggleFullScreen, settoggleFullScreen }}
                >
                  <imagePreviewContext.Provider value={{ src, setSrc }}>
                    <showPlaylistsContext.Provider
                      value={{ showPlaylists, setShowPlaylists }}
                    >
                      <showRightContext.Provider
                        value={{ showRight, setShowRight }}
                      >
                        <durationContext.Provider
                          value={{ duration, setDuration }}
                        >
                          <currentTimeContext.Provider
                            value={{ currentTime, setCurrentTime }}
                          >
                            <GLOWAL_SEARCH_TEXT_CONTEXT.Provider
                              value={{ searchedText, setSearchedText }}
                            >
                              <middleWidthContex.Provider
                                value={{ middleWidth, setMiddleWidth }}
                              >
                                {children}
                              </middleWidthContex.Provider>
                            </GLOWAL_SEARCH_TEXT_CONTEXT.Provider>
                          </currentTimeContext.Provider>
                        </durationContext.Provider>
                      </showRightContext.Provider>
                    </showPlaylistsContext.Provider>
                  </imagePreviewContext.Provider>
                </ToggleFullScreenContext.Provider>
              </PlaylistsProvider>
            </PlayerProvider>
          </isPlayingContext.Provider>
        </audioRefContext.Provider>
      </UserProvider>
    </SpotifyToastProvider>
  );
};

export default BodyToRender;
