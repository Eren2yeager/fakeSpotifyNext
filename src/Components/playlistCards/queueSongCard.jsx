import React, { useState, useContext, useEffect } from "react";

import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import Pillers from "@/Components/Helper/pillers";
import { usePlayer } from "@/Contexts/playerContext";
import {useLibrary } from "@/Contexts/libraryContext";
import ThreeDots from "../Helper/ThreeDots";
import { useRouter } from "next/navigation";
const QueueSongCard = (props) => {
  const { currentSong,  context, play , isPlaying , setIsPlaying ,audioRef} = usePlayer();

  const [isHovering, setIsHovering] = useState(NaN);

  const { library } = useLibrary();
  const router = useRouter()
  let conditionCheck;
  conditionCheck =
    currentSong?._id == props.item?._id && context.id === props.context.id;



    
  const handlePlay = () => {
    if (currentSong == null || !conditionCheck) {
      play(props.allSongs, props.item, props.context);
          // Get current recent searches from localStorage, or start with empty array

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
            src={props.item?.image || "/images/notfound.png"}
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
            }`}
          >
            {conditionCheck && isPlaying && (
              <div className="mr-2">
                <Pillers />
              </div>
            )}
            <span className=" max-w-full truncate">{props.item?.name}</span>
          </div>
          <div className="text-sm  max-w-full truncate">
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

        <div className=" max-w-[50px] px-1  truncate  flex justify-end sm:justify-center sm:invisible group-hover/songbar:visible">
          <ThreeDots song={props.item} />
        </div>
    </div>
  );
};

export default QueueSongCard;
