import React from "react";
export const metadata = {
    title: "Library - Fake Spotify",
  };
   function PlaylistLayout({ children }) {
  
  
  
      return <>{children}</>;
    }
  
    export default React.memo(PlaylistLayout)