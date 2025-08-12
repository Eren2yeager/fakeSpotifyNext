import React, { useEffect } from "react";

import { IoIosPlay, IoIosPause } from "react-icons/io";
import Pillers from "@/Components/Helper/pillers";
import { usePlayer } from "@/Contexts/playerContext";
import { useLibrary } from "@/Contexts/libraryContext";
import ThreeDots from "../Helper/ThreeDots";
import { useRouter } from "next/navigation";

/**
 * This card was overflowing because:
 * - The outer divs did not have proper min-w-0 or overflow-hidden on flex children.
 * - The text containers did not have min-w-0, so truncation didn't work as expected.
 * - The structure was not matching the "RecentsGroupCard" which works.
 * 
 * This rewrite matches the structure of RecentsGroupCard and ensures all flex children
 * have min-w-0 and text containers have truncate/min-w-0/max-w-full.
 * 
 * Hover state is now handled with Tailwind group-hover utilities, not React state.
 */
const QueueSongCard = (props) => {
  const { currentSong, context, play, isPlaying, setIsPlaying, audioRef } = usePlayer();
  const { library } = useLibrary();
  const router = useRouter();

  // Match context check logic
  const conditionCheck =
    currentSong?._id === props.item?._id && context.id === props.context?.id && context?.type === props.context?.type;

  const handlePlay = (e) => {
    e?.stopPropagation?.();
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

  useEffect(() => {}, [props.item, library]);

  return (
    <div
      className="flex items-center justify-between text-gray-400 h-[60px] px-2 hover:bg-white/8 rounded-[5px] group/songbar cursor-pointer w-full"
      style={{ minWidth: 0 }}
      onClick={() => {
        window.innerWidth <= 640 ? handleSongSet() : undefined;
      }}
      onDoubleClick={() => {
        window.innerWidth >= 640 ? handleSongSet() : undefined;
      }}
    >
      <div className="flex items-center gap-3 min-w-0 w-full">
        <div className="w-10 h-10 relative flex-shrink-0">
          <img
            src={props.item?.image || "/images/notfound.png"}
            alt={`song cover ${props.index}`}
            className="w-10 h-10 rounded object-cover cursor-pointer group-hover/songbar:opacity-50 transition-opacity"
            style={{ minWidth: 40, minHeight: 40 }}
          />
          <span
            className="absolute text-white bottom-1/5 left-1/5 invisible group-hover/songbar:visible "
            onClick={handlePlay}
          >
            {conditionCheck && isPlaying ? (
              <IoIosPause className="text-2xl cursor-pointer" />
            ) : (
              <IoIosPlay className="text-2xl cursor-pointer" />
            )}
          </span>
        </div>
        <div className="truncate min-w-0 w-full">
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
            <span className="truncate min-w-0 max-w-full">{props.item?.name}</span>
          </div>
          <div className="text-sm truncate min-w-0 max-w-full">
            <span
              className="hover:underline"
              onClick={e => {
                e.stopPropagation();
                props.item?.artist?._id &&
                  router.push(`/artists/${props.item?.artist._id}`);
              }}
            >
              {props.item?.artist?.name || "Unknown Artist"}
            </span>
          </div>
        </div>
      </div>
      <div className="max-w-[50px] px-1 flex-shrink-0 flex justify-end sm:justify-center sm:invisible group-hover/songbar:visible">
        <ThreeDots song={props.item} />
      </div>
    </div>
  );
};

export default QueueSongCard;
