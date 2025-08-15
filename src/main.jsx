"use client";



import { OtherContextsProvider } from "./Contexts/otherContexts.js";
import { PlayerProvider } from "@/Contexts/playerContext.jsx";
import { LibraryProvider } from "./Contexts/libraryContext.jsx";
import { SpotifyToastProvider } from "./Contexts/SpotifyToastContext.jsx";
import { UserProvider } from "./Contexts/userContex.jsx";

// Remove unused imports and state to avoid build issues

const BodyToRender = ({ children }) => {


  return (
    <SpotifyToastProvider>
      <UserProvider>
        <PlayerProvider>
          <LibraryProvider>
          <OtherContextsProvider>
 
            
                        {children}
 
            </OtherContextsProvider>
          </LibraryProvider>
        </PlayerProvider>
      </UserProvider>
    </SpotifyToastProvider>
  );
};

export default BodyToRender;
