import React, { useState, useRef, useEffect, useContext } from "react";

import { useOtherContexts } from "@/Contexts/otherContexts";
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
import { usePlayer } from "@/Contexts/playerContext";
import CustomInputRange from "../Helper/customInputRange";
import { useRouter, usePathname } from "next/navigation";
const EndRight = () => {
  const [sliderValue, setsliderValue] = useState(100);

  const {
    toggleFullScreen,
    setToggleFullScreen,
    showRight,
    setShowRight,
    showPlaylists,
    setShowPlaylists,
  } = useOtherContexts();

  const { openQueue, setOpenQueue, audioRef } = usePlayer();
  const [localValue, setLocalValue] = useState(0);

  const router = useRouter();
  const pathname = usePathname();

  const toggleLyricsRoute = () => {
    // const next = !toggleLyrics;
    // settoggleLyrics(next);
    if (pathname !== "/lyrics") {
      router.push("/lyrics");
    } else {
      // Optionally, if router.back() doesn't leave /lyrics, force push to home
      router.push("/");
    }
  };

  const handleVolumeChange = (value) => {
    setsliderValue(value);
    const newVolume = value / 500;
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleClick = () => {
    setsliderValue(sliderValue > 0 ? 0 : 100);
    const newVolume = parseInt(sliderValue > 0 ? 0 : 100, 10) / 100;
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleFullScreen = () => {
    const newToggleFullScreen = !toggleFullScreen;

    // Update context state as before
    if (showRight) {
      setToggleFullScreen(newToggleFullScreen);
    } else {
      setShowRight(true);
      if (window.innerWidth <= 1280) {
        setShowPlaylists(false);
      }
      setToggleFullScreen(newToggleFullScreen);
    }

    // Update the URL query parameter
    const params = new URLSearchParams(window.location.search);
    params.set("toggleFullScreen", newToggleFullScreen ? "true" : "false");
    const newUrl =
      window.location.pathname +
      (params.toString() ? `?${params.toString()}` : "");
    router.push(newUrl, { scroll: false });
  };
  const handleOpenQueue = () => {
    const newOpenQueue = !openQueue;

    if (showRight) {
      setOpenQueue(newOpenQueue);
    } else {
      setShowRight(true);
      if (window.innerWidth <= 1280) {
        setShowPlaylists(false);
      }
      setOpenQueue(newOpenQueue);
    }
  };

  return (
    <div className="max-w-[100%] h-[100%] flex flex-col items-end xl:flex-row  xl:justify-end xl:items-center gap-2 xl:gap-5  p-3">
      <div className="flex w-auto  gap-3">
        {pathname == "/lyrics" ? (
          <MdLyrics
            className="text-xl cursor-pointer"
            title="Lyrics"
            onClick={toggleLyricsRoute}
          />
        ) : (
          <MdOutlineLyrics
            className="text-xl cursor-pointer"
            title="Lyrics"
            onClick={toggleLyricsRoute}
          />
        )}

        {openQueue ? (
          <HiQueueList
            className="text-xl cursor-pointer"
            title="Queue"
            onClick={handleOpenQueue}
          />
        ) : (
          <HiOutlineQueueList
            className="text-xl cursor-pointer"
            title="Queue"
            onClick={handleOpenQueue}
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
        {toggleFullScreen ? (
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

export default React.memo(EndRight);
