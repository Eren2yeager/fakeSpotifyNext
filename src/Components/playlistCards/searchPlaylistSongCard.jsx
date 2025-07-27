import React, { useState, useContext, useEffect } from "react";

import { IoMdAddCircleOutline } from "react-icons/io";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import { TiTick } from "react-icons/ti";
import { BsThreeDots } from "react-icons/bs";
import Pillers from "@/Components/Helper/pillers";
import { usePlayer } from "@/Contexts/playerContext";
import { isPlayingContext } from "@/Contexts/contexts";
import { audioRefContext } from "@/Contexts/contexts";
import ThreeDotsPopUp from "../popups/songThreeDotsPopUp";
import TickOrAdd from "../Helper/TickOrAdd";
import { usePlaylists } from "@/Contexts/playlistsContext";
import ThreeDots from "../Helper/ThreeDots";

const SearchPlaylistSongCard = (props) => {
  const Context_audio_ref = useContext(audioRefContext);
  const Context_isPlaying = useContext(isPlayingContext);

  const [isHovering, setIsHovering] = useState(NaN);
  const [addToLibrary, setaddToLibrary] = useState(false);

  const { currentSong, context, play } = usePlayer();
  const { playlists } = usePlaylists();

  let conditionCheck;
  conditionCheck =
    currentSong?._id == props.item._id && context.id === props.context.id;



    
  const handlePlay = () => {
    if (currentSong == null || !conditionCheck) {
      play(props.allSongs, props.item, props.context);
          // Get current recent searches from localStorage, or start with empty array
    let recentSearchesArray = [];
    try {
      const stored = localStorage.getItem("recentSearchesArray");
      if (stored) {
        recentSearchesArray = JSON.parse(stored);
      }
    } catch (e) {
      // If parsing fails, reset to empty array
      recentSearchesArray = [];
    }

    // Optionally: prevent duplicates (by _id)
    const alreadyExists = recentSearchesArray.some(
      (item) => item._id === props.item._id
    );
    if (!alreadyExists) {
      recentSearchesArray.push(props.item);
    }

    localStorage.setItem(
      "recentSearchesArray",
      JSON.stringify(recentSearchesArray)
    );
    } else {
      if (conditionCheck && Context_isPlaying.isPlaying) {
        Context_audio_ref.current.pause();
        Context_isPlaying.setisPlaying(false);
      } else {
        Context_audio_ref.current.play();
        Context_isPlaying.setisPlaying(true);
      }
    }
  };

  // just set the song
  const handleSongSet = () => {
    play(props.allSongs, props.item, props.context);
    // Get current recent searches from localStorage, or start with empty array
    let recentSearchesArray = [];
    try {
      const stored = localStorage.getItem("recentSearchesArray");
      if (stored) {
        recentSearchesArray = JSON.parse(stored);
      }
    } catch (e) {
      // If parsing fails, reset to empty array
      recentSearchesArray = [];
    }

    // Optionally: prevent duplicates (by _id)
    const alreadyExists = recentSearchesArray.some(
      (item) => item._id === props.item._id
    );
    if (!alreadyExists) {
      recentSearchesArray.push(props.item);
    }

    localStorage.setItem(
      "recentSearchesArray",
      JSON.stringify(recentSearchesArray)
    );


  };

  useEffect(() => {}, [props.item, playlists]);

  return (
    <div
      className="flex items-center justify-between text-gray-400  p-2  hover:bg-white/8  rounded-[5px] group/songbar cursor-pointer"
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
            {conditionCheck && Context_isPlaying.isPlaying ? (
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
            }`}
          >
            {conditionCheck && Context_isPlaying.isPlaying && (
              <div className="mr-2">
                <Pillers />
              </div>
            )}
            <span className=" max-w-full truncate">{props.item.name}</span>
          </div>
          <div className="text-sm  max-w-full truncate">
            {props.item.artist.name}
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
