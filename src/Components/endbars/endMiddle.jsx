import React, { useState, useRef, useEffect, useContext } from "react";


import LiveSeekbar from "../audioComponents/LiveSeekbar";

import { RxShuffle } from "react-icons/rx";
import { MdSkipPrevious } from "react-icons/md";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import { MdSkipNext } from "react-icons/md";
import { BsRepeat } from "react-icons/bs";
import { BsRepeat1 } from "react-icons/bs";
import AudioVisualizer from "../audioComponents/AudioVisulizer";
import { usePlayer } from "@/Contexts/playerContext";
const EndMiddle = (props) => {

  const { 
    currentSong, isPlaying, setIsPlaying, durationRef, currentTimeRef, audioRef,
    isShuffling, repeatMode, toggleShuffle, cycleRepeat, nextTrack, prevTrack
  } = usePlayer();
  const handlePlayPause = () => {
    if (currentSong) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center gap-5 sm:gap-2 py-2 items-center w-[100%] ">
        <div className="w-full  sm:hidden">
          <LiveSeekbar showTime={true} />
        </div>
        <div className="up flex gap-8 items-center w-full sm:w-fit justify-around">
          <RxShuffle
            className={`text-xl  cursor-pointer ${
              isShuffling
                ? `text-green-400 `
                : `text-gray-400 hover:animate-pulse `
            } transition-all duration-300`}
            onClick={toggleShuffle}
            title="Shuffle"
          />
          <MdSkipPrevious
            className="text-4xl sm:text-3xl  text-gray-400  hover:animate-pulse transition-all duration-300  cursor-pointer"
            title="Previous"
            onClick={prevTrack}
          />
          <span className="text-2xl font-bold text-center">
            <span
              className="bg-white p-1 rounded-full text-center flex justify-center items-center cursor-pointer"
              onClick={handlePlayPause}
            >
              <span>
                {isPlaying ? (
                  <IoIosPause
                    className=" text-black self-center text-5xl sm:text-2xl  "
                    title="Pause"
                  />
                ) : (
                  <IoIosPlay
                    className=" text-black self-center text-5xl sm:text-2xl pl-[2px]"
                    title="Play"
                  />
                )}
              </span>
            </span>
          </span>
          <MdSkipNext
            className="text-4xl sm:text-3xl  text-gray-400  hover:animate-pulse transition-all duration-100  cursor-pointer"
            title="Next"
            onClick={nextTrack}
          />
          <BsRepeat
            className={`text-xl  cursor-pointer ${
              repeatMode !== "off"
                ? `text-green-400 `
                : `text-gray-400 hover:animate-pulse `
            }  transition-all duration-300`}
            onClick={cycleRepeat}
            title={`Repeat ${repeatMode === "all" ? "All" : repeatMode === "one" ? "One" : "Off"}`}
          />
        </div>
        <div className="w-full hidden sm:block">
          <LiveSeekbar showTime={true} width="w-[60%]" />
        </div>
      </div>

      {/* this is glowal audio component that will serve its current time and duration for all other seekbars */}
      {/* if this component renders it will affect the audio component */}
    </>
  );
};

export default React.memo(EndMiddle);
