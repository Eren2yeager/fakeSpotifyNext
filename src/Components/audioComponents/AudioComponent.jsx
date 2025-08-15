"use client"
import React, { useContext,  useEffect , memo} from "react";
import { useOtherContexts } from "@/Contexts/otherContexts";
import { usePlayer } from "@/Contexts/playerContext";
import { useSession } from "next-auth/react";

const AudioComponent = () => {


  const  {toggleFullScreen ,setToggleFullScreen , showRight, setShowRight , showPlaylists, setShowPlaylists} = useOtherContexts()


  const { currentSong, isPlaying , setIsPlaying , durationRef , currentTimeRef , audioRef, nextTrack, context} = usePlayer();
  const { data: session } = useSession();
  




  const onLoadedMetadata = () => {
    durationRef.current = (audioRef.current?.duration);

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current
          .play()
          .then(() => {
            setShowRight(true);
            if(window.innerWidth <= 1280){
              setShowPlaylists(false)
            }
            setIsPlaying(true); // ✅ only after successful play

          })
          .catch((err) => {
            console.warn("Play failed:", err);
          });
      } else {
        // Do not auto-play if not already playing
        // Optionally, you can set currentTime or other state here if needed
      }
    }
  };
   


  





  // Update current time while playing
  const onTimeUpdate = () => {
    currentTimeRef.current = (audioRef.current?.currentTime);
  };

  // Record recents and increment view for every song play
  useEffect(() => {
    if (!currentSong || !session) return;

    let entityType = "Song";
    let entityId = currentSong._id;
    if (context?.type === "Album" || context?.type === "Playlist" || context?.type === "Artist") {
      entityType = context.type;
      entityId = context.id;
    }

    fetch("/api/recents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entityType,
        entityId,
        songId: currentSong._id,
      }),
    }).catch((err) => {
      console.error("Failed to record recents:", err);
    });

    // Increment song view count (fire-and-forget)
    fetch(`/api/songs/${currentSong._id}/view`, { method: "POST" }).catch(() => {});
  }, [currentSong?._id, session, context]);


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

    // Reload the audio element only when the song actually changes
    audioRef.current.pause();
    audioRef.current.src = currentSong.fileUrl;
    audioRef.current.load();  // ✅ triggers onLoadedMetadata
  }, [currentSong?._id , context?._id]);

  // // Prevent audio reloading when switching browser tabs
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.hidden && audioRef.current && isPlaying) {
  //       // Don't pause, just prevent reloading
  //       audioRef.current.currentTime = audioRef.current.currentTime;
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);
  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, [isPlaying]);
  

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
