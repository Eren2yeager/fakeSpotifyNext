import React, { useState, useContext, useEffect } from "react";

import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";

import Pillers from "@/Components/Helper/pillers";
import { usePlayer } from "@/Contexts/playerContext";
import TickOrAdd from "../Helper/TickOrAdd";
import { useLibrary } from "@/Contexts/libraryContext";
import ThreeDots from "../Helper/ThreeDots";
import { useRouter, usePathname } from "next/navigation";
import { useOtherContexts } from "@/Contexts/otherContexts";
const SearchPlaylistSongCard = (props) => {
  const [isHovering, setIsHovering] = useState(NaN);

  const { middleWidth } = useOtherContexts();

  const {
    currentSong,
    context,
    play,
    isPlaying,
    setIsPlaying,
    durationRef,
    currentTimeRef,
    audioRef,
  } = usePlayer();

  const { library } = useLibrary();
  const router = useRouter();
  const pathname = usePathname();

  let conditionCheck =
    currentSong?._id == props.item._id && context.id === props.context.id;

  // Helper to update recentSearchesArray only if on /search route
  const updateRecentSearchesIfSearchRoute = () => {
    if (pathname === "/search") {
      let recentSearchesArray = [];
      try {
        const stored = localStorage.getItem("recentSearchesArray");
        if (stored) {
          recentSearchesArray = JSON.parse(stored);
        }
      } catch (e) {
        recentSearchesArray = [];
      }

      // Optionally: prevent duplicates (by _id)
      const alreadyExists = recentSearchesArray.some(
        (item) => item._id === props.item._id
      );
      if (!alreadyExists) {
        recentSearchesArray.unshift(props.item);
      }

      localStorage.setItem(
        "recentSearchesArray",
        JSON.stringify(recentSearchesArray)
      );
    }
  };

  const handlePlay = () => {
    if (currentSong == null || !conditionCheck) {
      play(props.allSongs, props.item, props.context);
      updateRecentSearchesIfSearchRoute();
    } else {
      if (conditionCheck && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // just set the song
  const handleSongSet = () => {
    play(props.allSongs, props.item, props.context);
    updateRecentSearchesIfSearchRoute();
  };

  useEffect(() => {}, [props.item, library]);

  return (
    <div
      className="flex items-center justify-between text-gray-400 h-[60px] p-1  hover:bg-white/8  rounded-[5px] group/songbar cursor-pointer"
      onMouseEnter={() => {
        window.innerWidth >= 640 ? setIsHovering(props.index) : undefined;
      }}
      onMouseLeave={() => {
        window.innerWidth >= 640 ? setIsHovering(NaN) : undefined;
      }}
      onClick={() => {
        window.innerWidth <= 640 ? handleSongSet() : undefined;
      }}
      onDoubleClick={() => {
        window.innerWidth >= 640 ? handleSongSet() : undefined;
      }}
    >
      <div className=" truncate max-w-full  flex items-center gap-3">
        <div className="w-10 h-10 relative">
          <img
            src={props.item.image || "/images/notfound.png"}
            alt={`song cover ${props.index}`}
            className={`min-w-10 min-h-10 rounded  cursor-pointer ${
              isHovering || isHovering == 0 ? "opacity-50" : ""
            }`}
          />

          <span
            className={`absolute text-white bottom-1/5 left-1/5 ${
              isHovering || isHovering == 0 ? "visible" : "invisible"
            }`}
            onClick={() => {
              handlePlay();
            }}
          >
            {conditionCheck && isPlaying ? (
              <IoIosPause className="text-2xl  cursor-pointer" />
            ) : (
              <IoIosPlay className="text-2xl cursor-pointer" />
            )}
          </span>
        </div>
        <div className="truncate max-w-full">
          <div
            className={`font-semibold flex items-center ${
              conditionCheck ? "text-green-500" : "text-white"
            } ${middleWidth >= 640 ? "text-md" : "text-sm"}`}
          >
            {conditionCheck && isPlaying && (
              <div className="mr-2">
                <Pillers />
              </div>
            )}
            <span className=" max-w-full truncate">{props.item.name}</span>
          </div>
          <div className={`text-sm  max-w-full truncate ${middleWidth >= 640 ? "text-sm" : "text-xs"}`}>
            <span
              className="hover:underline"
              onClick={() => {
                props.item?.artist._id &&
                  router.push(`/artists/${props.item?.artist._id}`);
              }}
            >
              {props.item?.artist?.name || "Unknown Artist"}
            </span>
          </div>
        </div>
      </div>
      <div className="w-fit justify-end flex items-center ">
        <div className=" w-[50px] text-right truncate flex justify-center ">
          <span className=" transform active:scale-90 hover:scale-110 transition-200 p-1 sm:invisible group-hover/songbar:visible">
            <TickOrAdd song={props.item} />
          </span>
        </div>
        <div className=" w-[50px] text-center   hidden sm:block">
          {props.item?.duration}
        </div>
        <div className=" w-[50px]   truncate  flex justify-end sm:justify-center sm:invisible group-hover/songbar:visible">
          <ThreeDots song={props.item} />
        </div>
      </div>
    </div>
  );
};

export default SearchPlaylistSongCard;
