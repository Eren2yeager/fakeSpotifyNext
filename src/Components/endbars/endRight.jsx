import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useTransition,
} from "react";

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
    showLibrary,
    setShowLibrary,
  } = useOtherContexts();

  const { openQueue, setOpenQueue, audioRef } = usePlayer();
  const [localValue, setLocalValue] = useState(0);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const pathname = usePathname();

  const toggleLyricsRoute = () => {
    startTransition(async () => {
      // const next = !toggleLyrics;
      // settoggleLyrics(next);
      if (pathname !== "/lyrics") {
        router.push("/lyrics");
      } else {
        // Optionally, if router.back() doesn't leave /lyrics, force push to home
        router.push("/");
      }
    });
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

  const handleFullScreen = async() => {
    startTransition(async () => {
      const newToggleFullScreen = !toggleFullScreen;

      // Update context state as before
      if (showRight) {
        setToggleFullScreen(newToggleFullScreen);
      } else {
        setShowRight(true);
        if (window.innerWidth <= 1280) {
          setShowLibrary(false);
        }
        setToggleFullScreen(newToggleFullScreen);
      }
    });
  };
  const handleOpenQueue =  () => {
    startTransition(async () => {
      const newOpenQueue = !openQueue;

      if (showRight) {
         setOpenQueue(newOpenQueue);
      } else {
        setShowRight(true);
        if (window.innerWidth <= 1280) {
          setShowLibrary(false);
        }
         setOpenQueue(newOpenQueue);
      }
    })
  };

  return (
    <div className="max-w-[100%] h-[100%] flex flex-col items-end xl:flex-row  xl:justify-end xl:items-center gap-2 xl:gap-5  p-3">
      <div className="flex w-auto  gap-3">
        {pathname == "/lyrics" ? (
          <MdLyrics
            className={`text-xl cursor-pointer ${isPending ? "opacity-50 pointer-events-none" : ""}`}
            title="Lyrics"
            onClick={isPending ? undefined : toggleLyricsRoute}
            disabled={isPending}
          />
        ) : (
          <MdOutlineLyrics
            className={`text-xl cursor-pointer ${isPending ? "opacity-50 pointer-events-none" : ""}`}
            title="Lyrics"
            onClick={isPending ? undefined : toggleLyricsRoute}
            disabled={isPending}
          />
        )}

        {openQueue ? (
          <HiQueueList
            className={`text-xl cursor-pointer ${isPending ? "opacity-50 pointer-events-none" : ""}`}
            title="Queue"
            onClick={isPending ? undefined : handleOpenQueue}
            disabled={isPending}
          />
        ) : (
          <HiOutlineQueueList
            className={`text-xl cursor-pointer ${isPending ? "opacity-50 pointer-events-none" : ""}`}
            title="Queue"
            onClick={isPending ? undefined : handleOpenQueue}
            disabled={isPending}
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
            className={`text-xl cursor-pointer transition-all duration-300 transform hover:scale-90 ${isPending ? "opacity-50 pointer-events-none" : ""}`}
            title="FullScreen"
            onClick={isPending ? undefined : handleFullScreen}
            disabled={isPending}
          />
        ) : (
          <GoScreenFull
            className={`text-xl cursor-pointer transition-all duration-300 transform hover:scale-110 ${isPending ? "opacity-50 pointer-events-none" : ""}`}
            title="FullScreen"
            onClick={isPending ? undefined : handleFullScreen}
            disabled={isPending}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(EndRight);
