import React, { useState, useRef, useContext, useEffect } from "react";

import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import { useOtherContexts } from "@/Contexts/otherContexts";
import dateFormatter from "../../functions/dateFormatter";
import Pillers from "../Helper/pillers";
import { usePlayer } from "../../Contexts/playerContext";
import TickOrAdd from "../Helper/TickOrAdd";
import { useLibrary } from "@/Contexts/libraryContext";
import { useRouter } from "next/navigation";
import ThreeDots from "../Helper/ThreeDots";
import HighlightText from "../Helper/highlitedText";
const MiddlePlaylistSongCard = (props) => {

  const { middleWidth } = useOtherContexts();


  const [isHovering, setIsHovering] = useState(NaN);

  const { currentSong,  context, play , isPlaying , setIsPlaying , durationRef , currentTimeRef , audioRef} = usePlayer();

  const { library } = useLibrary();
  const router = useRouter();
  useEffect(() => {}, [library]);

  let conditionCheck;
  conditionCheck =
    currentSong?._id === props.item?._id && context?.id === props.context?.id;

  const handlePlay = () => {
    if (currentSong == null || !conditionCheck) {
      play(props.allSongs, props.item, props.context);
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

  // for three dots

  const clickedItem = useRef(null);
  return (
    <div
      className="flex items-center text-gray-400  p-1 px-3 h-[60px] hover:bg-white/8  rounded-[5px] group/songbar cursor-pointer"
      onMouseEnter={() => {
        window.innerWidth >= 640 ? setIsHovering(props.index) : undefined;
      }}
      onMouseLeave={() => {
        window.innerWidth >= 640 ? setIsHovering(NaN) : undefined;
      }}
      onClick={() => {
        window.innerWidth <= 640
          ? handleSongSet()
          : () => {
              clickedItem.current = true;
            };
      }}
      onDoubleClick={() => {
        window.innerWidth >= 640 ? handleSongSet() : undefined;
      }}
    >
      {/* handle hovering show playbutton */}
      {props.showIndexes == true && (
        <div className="w-[40px] ">
          {/* to match the current song with playlist songs and toggle play pause  */}
          {isHovering === props.index || clickedItem === props.index ? (
            <span
              onClick={() => {
                handlePlay();
              }}
            >
              {conditionCheck && isPlaying ? (
                <IoIosPause className="text-2xl cursor-pointer" />
              ) : (
                <IoIosPlay className="text-2xl cursor-pointer" />
              )}
            </span>
          ) : conditionCheck && isPlaying ? (
            <Pillers />
          ) : (
            <span
              className={`px-1 mx-auto ${conditionCheck && "text-green-500"}`}
            >
              {props.index + 1}
            </span>
          )}
        </div>
      )}
      <div
        style={
          window.innerWidth > 640
            ? { width: `${props.titleWidth}px` }
            : { width: `100%` }
        }
        className=" truncate  flex items-center gap-3 pr-5 w-full"
      >
        {" "}
        <div className="w-10 h-10 relative">
          <img
            src={props.item?.image || "/images/notfound.png"}
            alt={`song cover ${props.index}`}
            className={`min-w-10 min-h-10 rounded  cursor-pointer ${
              isHovering || isHovering == 0 ? "opacity-50" : ""
            }`}
          />
          {!props.showIndexes && (
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
          )}
        </div>
        <div className="truncate">
          <div
            className={`font-semibold   ${
              conditionCheck ? "text-green-500" : "text-white"
            }  truncate ${middleWidth >= 640 ? "text-md" : "text-sm"}`}
          >
                    {HighlightText(   props.item?.name, props.searchText)}
          </div>
          <div className={` text-white/50  max-w-[100%] truncate ${middleWidth >= 640 ? "text-sm" : "text-xs"}`}>
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

      {props.wantAlbum != false && (
        <div
          style={{ width: `${props.albumWidth}px` }}
          className={`truncate  ${
            middleWidth >= 700 ? "block" : "hidden"
          } pr-5 `}
        >
          <span
            className="hover:underline"
            onClick={() => {
              props.item?.album._id &&
                router.push(`/albums/${props.item?.album._id}`);
            }}
          >
            {props.item?.album?.name}
          </span>
        </div>
      )}

      {props.wantAdded != false && props.added && (
        <div
          style={{ width: `${props.dateAddedWidth}px` }}
          className={`mr-auto truncate  ${
            middleWidth >= 800 ? "block" : "hidden"
          } pr-5`}
        >
          {dateFormatter(props.added)}
        </div>
      )}
      <div className="w-[50px] text-right truncate flex justify-center ml-auto">
        <span
          className={`transform  active:scale-90 hover:scale-110 transition-200 p-1  ${
            clickedItem.current == props.index && "visible"
          }  sm:invisible group-hover/songbar:visible`}
        >
          <TickOrAdd song={props.item} />
        </span>
      </div>
      <div className=" w-[50px] text-center  hidden sm:block ">
        {props.item?.duration}
      </div>
      <div
        className={`w-[50px] ${
          clickedItem.current == props.index && "visible"
        }  truncate  flex justify-end sm:justify-center sm:invisible group-hover/songbar:visible`}
      >
        <ThreeDots
          song={props.item}
          playlistId={props.playlistId}
          playlistCreaterId={props.playlistCreaterId}
        />
      </div>
    </div>
  );
};

export default MiddlePlaylistSongCard;
