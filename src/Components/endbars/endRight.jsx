import React, { useState, useRef, useEffect, useContext } from "react";
import {
  ToggleFullScreenContext,
  showRightContext,
  showPlaylistsContext
} from "../../Contexts/contexts";

import { audioRefContext } from "../../Contexts/contexts";

import { MdLyrics } from "react-icons/md";
import { MdOutlineLyrics } from "react-icons/md";
import { FiVolumeX } from "react-icons/fi";
import { FiVolume } from "react-icons/fi";
import { FiVolume1 } from "react-icons/fi";
import { FiVolume2 } from "react-icons/fi";
import { GoScreenFull } from "react-icons/go";
import { GoScreenNormal } from "react-icons/go";
import { HiQueueList } from "react-icons/hi2";
import { HiOutlineQueueList } from "react-icons/hi2";

import CustomInputRange from "../Helper/customInputRange";

const EndRight = () => {
  const [sliderValue, setsliderValue] = useState(100);
  const [toggleLyrics, settoggleLyrics] = useState(false);
  const [toggleQueue, settoggleQueue] = useState(false);
  const ContextFullScreen = useContext(ToggleFullScreenContext);
  const ContextAudioRef = useContext(audioRefContext);
  const ContextShowRight = useContext(showRightContext);
  const ContextShowPlaylists = useContext(showPlaylistsContext);

  const [localValue, setLocalValue] = useState(0);

  const handleVolumeChange = (value) => {
    setsliderValue(value);
    const newVolume = value / 500;
    if (ContextAudioRef.current) {
      ContextAudioRef.current.volume = newVolume;
    }
  };



  const handleClick = () => {
    setsliderValue(sliderValue > 0 ? 0 : 100);
    const newVolume = parseInt(sliderValue > 0 ? 0 : 100, 10) / 100;
    if (ContextAudioRef.current) {
      ContextAudioRef.current.volume = newVolume;
    }
  };
  const handleFullScreen = () => {
    if (ContextShowRight.showRight) {
      ContextFullScreen.settoggleFullScreen(
        !ContextFullScreen.toggleFullScreen
      );
    } else {
      ContextShowRight.setShowRight(true);
      if(window.innerWidth <= 1280){
        ContextShowPlaylists.setShowPlaylists(false)
      }
      ContextFullScreen.settoggleFullScreen(
        !ContextFullScreen.toggleFullScreen
      );

    }
  };

  return (
    <div className="max-w-[100%] h-[100%] flex flex-col items-end xl:flex-row  xl:justify-end xl:items-center gap-2 xl:gap-5  p-3">
      <div className="flex w-auto  gap-3">
        {toggleLyrics ? (
          <MdLyrics
            className="text-xl cursor-pointer"
            title="Lyrics"
            onClick={() => {
              settoggleLyrics(!toggleLyrics);
            }}
          />
        ) : (
          <MdOutlineLyrics
            className="text-xl cursor-pointer"
            title="Lyrics"
            onClick={() => {
              settoggleLyrics(!toggleLyrics);
            }}
          />
        )}

        {toggleQueue ? (
          <HiQueueList
            className="text-xl cursor-pointer"
            title="Queue"
            onClick={() => {
              settoggleQueue(!toggleQueue);
            }}
          />
        ) : (
          <HiOutlineQueueList
            className="text-xl cursor-pointer"
            title="Queue"
            onClick={() => {
              settoggleQueue(!toggleQueue);
            }}
          />
        )}
      </div>
      <div
        className="flex gap-2 max-w-[100%] justify-end items-center m-0 p-0 "
        title="Volume"
      >
        <div onClick={handleClick}>
          {sliderValue == 0 ? (
            <FiVolumeX className="text-xl cursor-pointer" />
          ) : sliderValue > 0 && sliderValue < 50 ? (
            <FiVolume className="text-xl cursor-pointer" />
          ) : sliderValue >= 50 && sliderValue < 80 ? (
            <FiVolume1 className="text-xl cursor-pointer" />
          ) : (
            <FiVolume2 className="text-xl cursor-pointer" />
          )}
        </div>

        <CustomInputRange
          width="w-30 max-w-[100%]"
          min={0}
          max={100}
          value={sliderValue}
          onChange={handleVolumeChange}
        />
        {ContextFullScreen.toggleFullScreen ? (
          <GoScreenNormal
            className="text-xl cursor-pointer transition-all duration-300 transform hover:scale-90"
            title="FullScreen"
            onClick={handleFullScreen}
          />
        ) : (
          <GoScreenFull
            className="text-xl cursor-pointer transition-all duration-300 transform hover:scale-110"
            title="FullScreen"
            onClick={handleFullScreen}
          />
        )}
      </div>
    </div>
  );
};

export default EndRight;
