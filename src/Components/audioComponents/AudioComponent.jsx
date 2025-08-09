"use client"
import React, { useContext,  useEffect , memo} from "react";
import { showRightContext , showPlaylistsContext} from "@/Contexts/contexts";

import { usePlayer } from "@/Contexts/playerContext";
import { useSession } from "next-auth/react";

const AudioComponent = () => {

  const ContextShowRight= useContext(showRightContext)
  const ContextShowPlaylists= useContext(showPlaylistsContext)
  

  const { currentSong, isPlaying , setIsPlaying , durationRef , currentTimeRef , audioRef, nextTrack, context, positionSec} = usePlayer();
  const { data: session } = useSession();
  




  const onLoadedMetadata = () => {
    durationRef.current = (audioRef.current?.duration);
  
    if (audioRef.current) {
      // Seek to last known position if any
      if (positionSec && positionSec > 0) {
        try {
          audioRef.current.currentTime = positionSec;
        } catch {}
      }

      // Only play if user intended playback
      if (isPlaying) {
        audioRef.current
          .play()
          .then(() => {
            ContextShowRight.setShowRight(true);
            if(window.innerWidth <= 1280){
              ContextShowPlaylists.setShowPlaylists(false)
            }
            setIsPlaying(true); // ✅ only after successful play
            
            // Record song in recents
            if (session && currentSong) {
              try {
                fetch("/api/recents", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    entityType: "Song",
                    entityId: currentSong._id,
                    songId: currentSong._id,
                    parent: context
                  })
                });
              } catch (err) {
                console.error("Failed to record song in recents:", err);
              }
            }
          })
          .catch((err) => {
            console.warn("Play failed:", err);
          });
      }
    }
  };
   





  // Update current time while playing
  const onTimeUpdate = () => {
    currentTimeRef.current = (audioRef.current?.currentTime);
  };



// handle play pause
  const handlePlayPause = () => {
    if(currentSong){

      if (isPlaying) {
        audioRef.current.pause();
       setIsPlaying(false);
      } else {
        audioRef.current.play();
       setIsPlaying(true);
      }
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
    if (!currentSong || !audioRef.current) return;
  
    const audio = audioRef.current;
    audio.pause();
    audio.src = currentSong.fileUrl;
    audio.load();  // ✅ triggers onLoadedMetadata
  }, [currentSong]);

  // Prevent audio reloading when switching browser tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && audioRef.current && isPlaying) {
        // Don't pause, just prevent reloading
        audioRef.current.currentTime = audioRef.current.currentTime;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);
  

  return (
    <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-2 self-baseline-last">

      <audio
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={nextTrack}
        ref={audioRef}
        src={currentSong?.fileUrl || null}
      ></audio>
    </div>
  );
};

export default memo(AudioComponent);
