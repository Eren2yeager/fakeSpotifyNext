"use client";
import React, {useState, useContext ,useEffect } from "react";

import { useOtherContexts } from "@/Contexts/otherContexts";
import { GoHome, GoHomeFill } from "react-icons/go";
import { RiSearchEyeFill, RiSearchLine } from "react-icons/ri";
import { IoLibraryOutline, IoLibrary } from "react-icons/io5";
import { GrAdd } from "react-icons/gr";

import RectangularSongCard from "./RectangularSongCard";
import { usePlayer } from "@/Contexts/playerContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SuggestBgColor from "@/functions/bgSuggester";
import AddButton from "../Helper/AddButton";

const SmallEndbar = (props) => {
  const pathname = usePathname();
  const isActive = (route) => pathname === route;
  

 
  
  const  {toggleFullScreen ,setToggleFullScreen , showRight, setShowRight} = useOtherContexts()

  const handleFullScreen = () => {
    if (showRight) {
      setToggleFullScreen(!toggleFullScreen);
    } else {
      setShowRight(true);
      setToggleFullScreen(!toggleFullScreen);
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
        console.error("Error getting average color:", err);
      }
    }
    setBG();

  }, [currentSong , selectedSong]);

  return (
    <footer
      className={`${
        toggleFullScreen ? "invisible" : "visible"
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
            song={selectedSong}
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
          <Link href="/library">
            {isActive("/library") ? (
              <IoLibrary className="text-2xl font-bold" />
            ) : (
              <IoLibraryOutline className="text-2xl font-bold" />
            )}
          </Link>
          <span className="text-xs">Your library</span>
        </div>

        <div className="flex flex-col items-center relative">
          <span className="z-1 top-0 right-0 absolute opacity-0"><AddButton /></span>
          <GrAdd className="text-2xl font-bold" />
          <span className="text-xs">Create</span>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(SmallEndbar);
