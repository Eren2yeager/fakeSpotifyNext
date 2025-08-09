"use client"
import React, { useEffect, useState, useContext } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import { usePlayer } from "@/Contexts/playerContext";
import { useLibrary } from "@/Contexts/libraryContext";
import Pillers from "@/Components/Helper/pillers";
const PlaylistCard = (props) => {




    // to play the song from playlist or just a song
    const { handlePlayFromType, conditionCheckForSong , currentSong,  context, play , isPlaying , setIsPlaying ,audioRef} = usePlayer();

    // it will tell the what is currenty playlist
    const conditionCheck = conditionCheckForSong(props.item);

  return (
    <div className="group/PlaylistCard relative flex items-center bg-white/5 backdrop-blur-md hover:bg-white/8 rounded-md  transition group cursor-pointer z-10 truncate w-full">
      <Link href={`/playlists/${props.item._id}`}>
        <div className="flex gap-3 items-center overflow-clip">
          <img
            src={props.item.image}
            alt={props.item.name}
            className="w-12 h-12 rounded-sm object-cover"
          />
          <p
            className={`text-wrap max-w-[95%]  overflow-hidden text-ellipsis break-words text-[0.7em] sm:text-[1em] pr-2  font-sans  truncate max-w-auto ${
              conditionCheck
              
                ? `text-green-500`
                : `text-white`
            } `}
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {props.item?.name || props.item?.title}
          </p>
        </div>
      </Link>
      <div
        className={`absolute right-2  p-2 bg-green-500 rounded-full ${conditionCheck && isPlaying ? 'visible' :'invisible'} group-hover/PlaylistCard:visible text-black`}
        onClick={() => {
          handlePlayFromType(props.item);
        }}
      >
        {conditionCheck ==true && isPlaying ? (
          <IoIosPause className="text-2xl  cursor-pointer" />
        ) : (
          <IoIosPlay className="text-2xl pl-0.5 cursor-pointer" />
        )}
      </div>
      <div className="ml-auto mr-5 group-hover/PlaylistCard:hidden">
        {conditionCheck== true &&
          isPlaying && <Pillers />}
      </div>
    </div>
  );
};

const GridCellContainer = () => {

  const {library} = useLibrary();

  return(
 <>
  {
    library !== null && 
      <>
        <div className="px-5 pt-2 ">
          <div className="grid grid-cols-2  sm:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]  gap-4">
            {library?.playlists?.slice(0, 8).map((pl, idx) => (
              pl.songs.length > 0 &&
              <PlaylistCard key={idx} index={idx} item={pl} />
            ))}
          </div>
        </div>
      </>
    
  }
</>
)
};

export default React.memo(GridCellContainer);
