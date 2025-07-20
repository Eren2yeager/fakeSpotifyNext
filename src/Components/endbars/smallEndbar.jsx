"use client";
import React, {useState, useContext ,useEffect } from "react";
import {
  ToggleFullScreenContext,
  showRightContext,
} from "@/Contexts/contexts";

import { GoHome, GoHomeFill } from "react-icons/go";
import { RiSearchEyeFill, RiSearchLine } from "react-icons/ri";
import { IoLibraryOutline, IoLibrary } from "react-icons/io5";
import { GrAdd } from "react-icons/gr";

import RectangularSongCard from "./RectangularSongCard";
import { CURRENT_SONG_CONTEXT } from "@/Contexts/audio.controls.";
import { usePlayer } from "@/Contexts/playerContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SuggestBgColor from "@/functions/bgSuggester";

const SmallEndbar = (props) => {
  const pathname = usePathname();
  const isActive = (route) => pathname === route;
  
  const ContextFullScreen = useContext(ToggleFullScreenContext);
  const ContextShowRight = useContext(showRightContext);

  const handleFullScreen = () => {
    if (ContextShowRight.showRight) {
      ContextFullScreen.settoggleFullScreen(!ContextFullScreen.toggleFullScreen);
    } else {
      ContextShowRight.setShowRight(true);
      ContextFullScreen.settoggleFullScreen(!ContextFullScreen.toggleFullScreen);
    }
  };
  
  const [selectedSong, setSelectedSong] = useState(null);
  const [bgColor, setBgColor] = useState(null);
  const {currentSong , context} =usePlayer()

  useEffect(() => {
    if (!currentSong) return;

    setSelectedSong(currentSong);
    const setBG = async () => {
      if (!selectedSong?.image) return;
      
      try {
        const color = await SuggestBgColor(selectedSong.image);
         
        setBgColor(color); // or color.rgb
      } catch (err) {
        console.log("Error getting average color:", err);
      }
    }
    setBG();

  }, [currentSong , selectedSong]);

  return (
    <footer
      className={`${
        ContextFullScreen.toggleFullScreen ? "invisible" : "visible"
      } backdrop-blur-xs z-50 rounded-t-3xl text-amber-50 w-full flex flex-col justify-start max-h-[150px] fixed bottom-0 bg-gradient-to-t from-black to-black/50 pb-5 px-2 ${
        props.className
      }`}
    >
      {currentSong !== null && (
        <div onClick={handleFullScreen}>
          <RectangularSongCard
            marquee={{ show: true }}
            showPlayButton={true}
            showAudioComponent={true}
            showAddTolibraryButton={true}
            bgColor={bgColor}
            songName={selectedSong?.name || "Select a Song to Play"}
            artistName={selectedSong?.artist?.name || " "}
            imageUrl={selectedSong?.image}
            showRightButton={true}
            className="justify-between"
          />
        </div>
      )}

      <div className="w-full flex justify-around items-start pt-3">
        <div className="flex flex-col items-center">
          <Link href="/home">
            {isActive("/home") ? ( 
              <GoHomeFill className="text-2xl font-bold" />
            ) : (
              <GoHome className="text-2xl font-bold" />
            )}
          </Link>
          <span className="text-xs">Home</span>
        </div>

        <div className="flex flex-col items-center">
          <Link href="/search">
            {isActive("/search") ? (
              <RiSearchEyeFill className="text-2xl font-bold" />
            ) : (
              <RiSearchLine className="text-2xl font-bold" />
            )}
          </Link>
          <span className="text-xs">Search</span>
        </div>

        <div className="flex flex-col items-center">
          <Link href="/playlists">
            {isActive("/playlists") ? (
              <IoLibrary className="text-2xl font-bold" />
            ) : (
              <IoLibraryOutline className="text-2xl font-bold" />
            )}
          </Link>
          <span className="text-xs">Your library</span>
        </div>

        <div className="flex flex-col items-center">
          <GrAdd className="text-2xl font-bold" />
          <span className="text-xs">Create</span>
        </div>
      </div>
    </footer>
  );
};

export default SmallEndbar;
