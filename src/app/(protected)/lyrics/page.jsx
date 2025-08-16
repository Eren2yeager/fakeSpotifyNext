"use client";

import React ,{useEffect} from "react";
import { usePlayer } from "@/Contexts/playerContext";
import SyncedLyrics from "@/Components/audioComponents/syncedLyrics";
import { useRouter } from "next/navigation";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";

const Page = () => {
  const { currentSong , audioRef } = usePlayer();
  const router = useRouter();
  const toast  = useSpotifyToast()

  useEffect(() => {
    // Always check for currentSong and its lyrics array
    if (
      !currentSong ||
      !Array.isArray(currentSong.lyrics) ||
      currentSong.lyrics.length === 0
    ) {
      toast({ text: "Current Playing Song has no lyrics" });
      // Use setTimeout to ensure navigation after toast
      setTimeout(() => {
        router.replace("/");
      }, 100);
    }
  }, [currentSong]);




  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      {currentSong?.lyrics ? (
        <SyncedLyrics
          lyrics={currentSong.lyrics}
          audioRef={audioRef}
          options={{
            autoScroll: true,
            smoothScroll: true,
            scrollOffset: 0,
          }}
          image={currentSong?.image}
          className={"w-full h-full rounded-xl shadow-2xl shadow-black "}
          lineClasses ={"text-4xl text-center"}
          wantHeading={false}
          nonActiveLineClasses={"text-white/50"}
          activeLineClasses={"text-white transform scale-110 transition-all duration-500"}
          previousLineClasses ={"text-white/50"}
        />
      )  : <div className="text-xl w-full h-full flex justify-center items-center font-sans ">Song has no Lyrics support</div>
    }
    </div>
  );
};

export default Page;
