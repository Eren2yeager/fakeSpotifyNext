"use client"
import React, { useContext,  useEffect} from "react";
import { audioRefContext, isPlayingContext ,showRightContext , showPlaylistsContext} from "@/Contexts/contexts";
import {
  currentTimeContext,
  durationContext,
} from "@/Contexts/audio.controls.";
import { usePlayer } from "@/Contexts/playerContext";

const AudioComponent = () => {
  const ContexCurrentTime = useContext(currentTimeContext);
  const ContextDuration = useContext(durationContext);
  const ContextAudioRef = useContext(audioRefContext);
  const ContextisPlaying = useContext(isPlayingContext);
  const ContextShowRight= useContext(showRightContext)
  const ContextShowPlaylists= useContext(showPlaylistsContext)
  
  // const ContextCurrentSong = React.useContext(CURRENT_SONG_CONTEXT);
  const { currentSong, queue, context } = usePlayer();
  




  const onLoadedMetadata = () => {
    ContextDuration.setDuration(ContextAudioRef.current?.duration);
  
    if (ContextAudioRef.current) {
      ContextAudioRef.current
        .play()
        .then(() => {
          ContextShowRight.setShowRight(true);
          if(window.innerWidth <= 1280){
            ContextShowPlaylists.setShowPlaylists(false)
          }
          ContextisPlaying.setisPlaying(true); // ✅ only after successful play
        })
        .catch((err) => {
          console.warn("Play failed:", err);
        });
    }
  };
   






  // Update current time while playing
  const onTimeUpdate = () => {
    ContexCurrentTime.setCurrentTime(ContextAudioRef.current?.currentTime);
  };



// handle play pause
  const handlePlayPause = () => {
    if (ContextisPlaying.isPlaying) {
      ContextAudioRef.current.pause();
      ContextisPlaying.setisPlaying(false);
    } else {
      ContextAudioRef.current.play();
      ContextisPlaying.setisPlaying(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isTyping =
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.isContentEditable;

      if (isTyping) return; // ⛔ Don't trigger anything if user is typing

      if (event.key === " ") {
        handlePlayPause();
      }
    };

    // Add the event listener when the component mounts
    document.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });


  useEffect(() => {
    if (!currentSong || !ContextAudioRef.current) return;
  
    const audio = ContextAudioRef.current;
    audio.pause();
    audio.src = currentSong.fileUrl;
    audio.load();  // ✅ triggers onLoadedMetadata
  }, [currentSong]);
  

  return (
    <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-2 self-baseline-last">

      <audio
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        ref={ContextAudioRef}
        src={currentSong?.fileUrl || null}
        autoPlay
      ></audio>
    </div>
  );
};

export default AudioComponent;
