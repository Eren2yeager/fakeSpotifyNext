import React from "react";
export const metadata = {
    title: "Profile - Fake Spotify",
  };
   function PlaylistLayout({ children }) {
  
  
  
      return <>{children}</>;
    }
  
    export default React.memo(PlaylistLayout)