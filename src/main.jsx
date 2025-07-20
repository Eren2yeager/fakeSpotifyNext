'use client'
import {  useRef, useState ,useEffect ,useContext} from "react";
import {ToggleFullScreenContext, audioRefContext,showRightContext, isPlayingContext ,playlists , imagePreviewContext ,showPlaylistsContext , middleWidthContex} from "./Contexts/contexts.js";
import { currentTimeContext ,durationContext ,CURRENT_SONG_CONTEXT} from "@/Contexts/audio.controls..js";
import { PlayerProvider } from "@/Contexts/playerContext.jsx";
import { GLOWAL_SEARCH_TEXT_CONTEXT } from "@/Contexts/search.controls.js";
import { useSession } from "next-auth/react";

 const BodyToRender = ({children}) => {
  const [toggleFullScreen, settoggleFullScreen] = useState(false);
  const [showRight, setShowRight] = useState(true);  
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [isPlaying, setisPlaying] = useState(false)
  const ContextAudioRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSong, setCurrentSong] = useState({});
  const [src, setSrc] = useState(null)
  const [allPlaylists, setAllPlaylists] = useState(null)

  const [middleWidth, setMiddleWidth] = useState(0);


  const {data: session} = useSession();

  console.log(session)
  
  // for Glowal_search_text
  const [searchedText,setSearchedText] = useState("");


    useEffect(() => {
       fetch("/api/playlists")
        .then(res => {
          if (!res.ok) {
            throw new Error("Failed to fetch playlists");
          }
          return res.json();
        })
        .then(data => {
          setAllPlaylists(data);
        })
        .catch(err => {
          console.error("❌ Error fetching playlists:", err);
        })

    }, []);
  
    
  


  return (

    <PlayerProvider >
    <ToggleFullScreenContext.Provider value={{ toggleFullScreen, settoggleFullScreen }} >
      <imagePreviewContext.Provider value={{src, setSrc}}>
      <playlists.Provider value={{allPlaylists,setAllPlaylists}}>
      <audioRefContext.Provider value={ContextAudioRef}>
        <isPlayingContext.Provider value={{isPlaying, setisPlaying}}>
        <showPlaylistsContext.Provider value={{showPlaylists, setShowPlaylists}}>
        <showRightContext.Provider value={{showRight, setShowRight}}>
        <CURRENT_SONG_CONTEXT.Provider value={{currentSong, setCurrentSong}}>
         <durationContext.Provider value={{duration,setDuration}}>
         <currentTimeContext.Provider value={{currentTime,setCurrentTime}}>
          <GLOWAL_SEARCH_TEXT_CONTEXT.Provider value={{searchedText,setSearchedText}}>
          <middleWidthContex.Provider value={{middleWidth, setMiddleWidth}}>
          {children}
          </middleWidthContex.Provider>
          </GLOWAL_SEARCH_TEXT_CONTEXT.Provider>
         </currentTimeContext.Provider>
        </durationContext.Provider>
        </CURRENT_SONG_CONTEXT.Provider>
        </showRightContext.Provider>
        </showPlaylistsContext.Provider>
        </isPlayingContext.Provider>
      </audioRefContext.Provider>
      </playlists.Provider >
      </imagePreviewContext.Provider>
    </ToggleFullScreenContext.Provider>
    </PlayerProvider>
  );
};

export default BodyToRender;