"use client";

import { OtherContextsProvider } from "./Contexts/otherContexts.js";
import { PlayerProvider } from "@/Contexts/playerContext.jsx";
import { LibraryProvider } from "./Contexts/libraryContext.jsx";
import { SpotifyToastProvider } from "./Contexts/SpotifyToastContext.jsx";
import { UserProvider } from "./Contexts/userContex.jsx";
import { ConfirmProvider } from "./Contexts/confirmContext.jsx";
// Remove unused imports and state to avoid build issues

const BodyToRender = ({ children }) => {
  return (
    <SpotifyToastProvider>
      <ConfirmProvider>
        <UserProvider>
          <PlayerProvider>
            <LibraryProvider>
              <OtherContextsProvider>{children}</OtherContextsProvider>
            </LibraryProvider>
          </PlayerProvider>
        </UserProvider>
      </ConfirmProvider>
    </SpotifyToastProvider>
  );
};

export default BodyToRender;
