import React, { useState, useRef, useEffect, useContext } from "react";


import LiveSeekbar from "../audioComponents/LiveSeekbar";

import { RxShuffle } from "react-icons/rx";
import { MdSkipPrevious } from "react-icons/md";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import { MdSkipNext } from "react-icons/md";
import { BsRepeat } from "react-icons/bs";
import { BsRepeat1 } from "react-icons/bs";
import { usePlayer } from "@/Contexts/playerContext";
const EndMiddle = (props) => {

  const { 
    currentSong, isPlaying, setIsPlaying, durationRef, currentTimeRef, audioRef, autoplayEnabled,
    isShuffling, repeatMode, toggleShuffle, cycleRepeat, nextTrack, prevTrack
  } = usePlayer();

  const isInAutoplay = !!autoplayEnabled;
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
          <button
            type="button"
            onClick={toggleShuffle}
            title="Shuffle"
            tabIndex={0}
            aria-pressed={isShuffling}
            disabled={isInAutoplay}
            aria-disabled={isInAutoplay}
            className={`text-xl transition-all duration-300 flex items-center justify-center
              ${isShuffling ? "text-green-400" : "text-gray-400 "}
              ${isInAutoplay ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
              bg-transparent border-none p-0 m-0`}
            style={{ background: "none", border: "none" }}
          >
            <RxShuffle />
          </button>
          <MdSkipPrevious
            className="text-4xl sm:text-3xl  text-gray-400   transition-all duration-300  cursor-pointer"
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
            className="text-4xl sm:text-3xl  text-gray-400   transition-all duration-100  cursor-pointer"
            title="Next"
            onClick={nextTrack}
          />
          <button
            type="button"
            onClick={cycleRepeat}
            title={repeatMode === "one" ? "Repeat One" : `Repeat ${repeatMode === "all" ? "All" : "Off"}`}
            disabled={isInAutoplay}
            tabIndex={0}
            aria-disabled={isInAutoplay}
            className={`text-xl transition-all duration-300 flex items-center justify-center
              ${repeatMode === "one"
                ? "text-green-400"
                : repeatMode === "all"
                  ? "text-green-400"
                  : "text-gray-400 "}
              ${isInAutoplay ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
              bg-transparent border-none p-0 m-0`}
            style={{ background: "none", border: "none" }}
          >
            {repeatMode === "one" ? (
              <BsRepeat1 />
            ) : (
              <BsRepeat />
            )}
          </button>
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
