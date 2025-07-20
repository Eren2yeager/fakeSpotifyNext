import { createContext } from "react";



export const audioRefContext =createContext(null);
export const showRightContext = createContext(null);
export const showPlaylistsContext = createContext(null);

export const isPlayingContext = createContext(false);


export const ToggleFullScreenContext = createContext(false);
export const imagePreviewContext = createContext(null)

export const playlists = createContext([{imageUrl:"/images/notfound.png",playlistName:'unknown'}]);


export const middleWidthContex = createContext()