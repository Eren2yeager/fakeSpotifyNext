import React from "react";
export const metadata = {
    title: "Playlists - Fake Spotify",
  };
   function PlaylistLayout({ children }) {
  
  
  
      return <>{children}</>;
    }
  
    export default React.memo(PlaylistLayout)