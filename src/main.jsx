"use client";

import { OtherContextsProvider } from "./Contexts/otherContexts.js";
import { PlayerProvider } from "@/Contexts/playerContext.jsx";
import { LibraryProvider } from "./Contexts/libraryContext.jsx";
import { SpotifyToastProvider } from "./Contexts/SpotifyToastContext.jsx";
import { NavWatchdogProvider } from "./Contexts/NavWatchdogContext.jsx";
import { UserProvider } from "./Contexts/userContex.jsx";
import { ConfirmProvider } from "./Contexts/confirmContext.jsx";
// Remove unused imports and state to avoid build issues

const BodyToRender = ({ children }) => {
  return (
    <SpotifyToastProvider>
    <NavWatchdogProvider overlay stallTimeoutMs={800} debounceMs={100}>
        <ConfirmProvider>
          <UserProvider>
            <PlayerProvider>
              <LibraryProvider>
                <OtherContextsProvider>{children}</OtherContextsProvider>
              </LibraryProvider>
            </PlayerProvider>
          </UserProvider>
        </ConfirmProvider>
      </NavWatchdogProvider>
    </SpotifyToastProvider>
  );
};

export default BodyToRender;
