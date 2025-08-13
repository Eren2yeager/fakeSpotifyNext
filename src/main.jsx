"use client";
import { useRef, useState } from "react";
import {
  ToggleFullScreenContext,
  showRightContext,
  imagePreviewContext,
  showPlaylistsContext,
  middleWidthContext,
} from "./Contexts/contexts.js";

import { PlayerProvider } from "@/Contexts/playerContext.jsx";
import { GLOWAL_SEARCH_TEXT_CONTEXT } from "@/Contexts/search.controls.js";
import { LibraryProvider } from "./Contexts/libraryContext.jsx";
import { SpotifyToastProvider } from "./Contexts/SpotifyToastContext.jsx";
import { UserProvider } from "./Contexts/userContex.jsx";

// Remove unused imports and state to avoid build issues

const BodyToRender = ({ children }) => {
  const [toggleFullScreen, settoggleFullScreen] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [src, setSrc] = useState(null);
  const [middleWidth, setMiddleWidth] = useState(0);
  const [searchedText, setSearchedText] = useState("");

  return (
    <SpotifyToastProvider>
      <UserProvider>
        <PlayerProvider>
          <LibraryProvider>
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
                    <GLOWAL_SEARCH_TEXT_CONTEXT.Provider
                      value={{ searchedText, setSearchedText }}
                    >
                      <middleWidthContext.Provider
                        value={{ middleWidth, setMiddleWidth }}
                      >
                        {children}
                      </middleWidthContext.Provider>
                    </GLOWAL_SEARCH_TEXT_CONTEXT.Provider>
                  </showRightContext.Provider>
                </showPlaylistsContext.Provider>
              </imagePreviewContext.Provider>
            </ToggleFullScreenContext.Provider>
          </LibraryProvider>
        </PlayerProvider>
      </UserProvider>
    </SpotifyToastProvider>
  );
};

export default BodyToRender;
