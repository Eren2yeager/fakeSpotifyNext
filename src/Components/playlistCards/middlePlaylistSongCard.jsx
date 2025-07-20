import React, { useState, useRef, useContext, useEffect } from "react";

import { IoMdAddCircleOutline } from "react-icons/io";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import { TiTick } from "react-icons/ti";
import { BsThreeDots } from "react-icons/bs";
import Pillers from "../Helper/pillers";
import { Navigate } from "react-router-dom";
import { usePlayer } from "../../Contexts/playerContext";
import { isPlayingContext } from "../../Contexts/contexts";
import dateFormatter from "../../functions/dateFormatter";
import { audioRefContext } from "../../Contexts/contexts";

const MiddlePlaylistSongCard = (props) => {
  const Context_audio_ref = useContext(audioRefContext);
  const Context_isPlaying = useContext(isPlayingContext);

  const [isHovering, setIsHovering] = useState(NaN);
  const [addToLibrary, setaddToLibrary] = useState(false);

  const { currentSong, context, play } = usePlayer();


  let conditionCheck;
  conditionCheck= (currentSong?._id == props.item._id && context.id === props.context.id);
  const handlePlay = () => {
    if (
      currentSong == null ||
      (!conditionCheck)
    ) {
      play(props.allSongs, props.item, props.context);
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
  };

  return (
    <div
      className="flex items-center text-gray-400  p-2  hover:bg-white/8  rounded-[5px] group/songbar cursor-pointer"
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
      {/* handle hovering show playbutton */}
      {props.showIndexes ==true && (
        <div className="w-[40px]">
          {/* to match the current song with playlist songs and toggle play pause  */}
          {isHovering === props.index ? (
            <span
              onClick={() => {
                handlePlay();
              }}
            >
              {conditionCheck &&
              Context_isPlaying.isPlaying ? (
                <IoIosPause className="text-2xl cursor-pointer" />
              ) : (
                <IoIosPlay className="text-2xl cursor-pointer" />
              )}
            </span>
          ) : conditionCheck &&
            Context_isPlaying.isPlaying ? (
            <Pillers />
          ) : (
            <span
              className={`px-1 mx-auto ${
                conditionCheck && "text-green-500"
              }`}
            >
              {props.index + 1}
            </span>
          )}
        </div>
      )}
      <div
        style={{ width: `${props.titleWidth}px` }}
        className=" truncate  flex items-center gap-3"
      >
        {" "}
        <div className="w-10 h-10 relative">
          <img
            src={props.item.image || "/images/notfound.png"}
            alt={`song cover ${props.index}`}
            className={`min-w-10 min-h-10 rounded  cursor-pointer ${isHovering || isHovering==0 ? "opacity-50":""}`}
          />
          {(!props.showIndexes) && (
            <span
              className={`absolute text-white bottom-1/5 left-1/5 ${isHovering || isHovering==0 ? "visible" :"invisible"}`}
              onClick={() => {
                handlePlay();
              }}
            >
              {conditionCheck &&
              Context_isPlaying.isPlaying ? (
                <IoIosPause className="text-2xl  cursor-pointer" />
              ) : (
                <IoIosPlay className="text-2xl cursor-pointer" />
              )}
            </span>)
 
          }
        </div>
        <div className="truncate">
          <div
            className={`font-semibold  ${
              conditionCheck
                ? "text-green-500"
                : "text-white"
            }  truncate`}
          >
            {props.item.name}
          </div>
          <div className="text-sm  max-w-[100%] truncate">
            {props.item.artist.name}
          </div>
        </div>
      </div>

      <div
        style={{ width: `${props.albumWidth}px` }}
        className=" truncate hidden sm:block"
      >
        {props.item.album?.name}
      </div>

      {props.added && (
        <div
          style={{ width: `${props.dateAddedWidth}px` }}
          className="mr-auto truncate hidden lg:block"
        >
          {dateFormatter(props.added)}
        </div>
      )}

      <div className=" w-[50px] text-right truncate flex justify-center ml-auto">
        <span className=" transform active:scale-90 hover:scale-110 transition-200 p-1 invisible group-hover/songbar:visible">
          {props.item?.savedIn?.length > 0 ? (
            <TiTick
              className="bg-green-600 rounded-full text-black animate-pulse cursor-pointer"
              size={20}
              onClick={() => {
                setaddToLibrary(!addToLibrary);
              }}
            />
          ) : (
            <IoMdAddCircleOutline
              className="cursor-pointer"
              size={20}
              onClick={() => {
                setaddToLibrary(!addToLibrary);
              }}
            />
          )}
        </span>
      </div>
      <div className=" w-[50px] text-center truncate hidden sm:block ">
        {props.item?.duration}
      </div>
      <div className=" w-[50px]   truncate  flex justify-end sm:justify-center sm:invisible group-hover/songbar:visible">
        <span className="p-1 transform active:scale-90 hover:scale-110 transition-200 cursor-pointer">
          <BsThreeDots className="text-xl transform rotate-90 sm:rotate-0" />
        </span>
      </div>
    </div>
  );
};

export default MiddlePlaylistSongCard;
