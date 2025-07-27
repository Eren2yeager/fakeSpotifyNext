"use client"
import React, { useEffect, useState, useContext } from "react";
import {
  isPlayingContext,

  audioRefContext,
} from "@/Contexts/contexts";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import { usePlayer } from "@/Contexts/playerContext";
import { usePlaylists } from "@/Contexts/playlistsContext";
import Pillers from "@/Components/Helper/pillers";

const PlaylistCard = (props) => {
  const pathName = usePathname();
  const Context_isPlaying = useContext(isPlayingContext);
  const Context_audio_ref = useContext(audioRefContext);
  const { play , currentSong , context  } = usePlayer();


  // 🔥 Derive this value based on current props + context
  let conditionCheck = false;
  if (props.item.type === "Song") {
    conditionCheck =
      currentSong?._id === props.item._id && props.item.type == context.type;
  } else if (props.item.type === "Artist") {
    conditionCheck =
      currentSong?.artist?._id === props.item._id &&
      props.item.type == context.type;
  } else if(props.item.type === "Album"){
    conditionCheck =
    currentSong?.album?._id === props.item._id &&
    props.item.type == context.type;
  }else if (props.item.type === "Playlist") {
    conditionCheck =
      props.item.songs?.some(
        (songData) => songData.song?._id === currentSong?._id
      ) && props.item.type == context.type;
  }

  const handlePlayFromType = async (type, id) => {


    if (
      currentSong == null ||
      conditionCheck == false
    ) {
      try {
        const res = await fetch(`/api/play/${type}/${id}`);
        const data = await res.json();
        play(data.songs, data.current, data.context);
      } catch (err) {
        console.error("Failed to play:", err);
      }
    } else {
      if (conditionCheck && Context_isPlaying.isPlaying ) {
        Context_audio_ref.current.pause();
        Context_isPlaying.setisPlaying(false);
      } else {
        Context_audio_ref.current.play();
        Context_isPlaying.setisPlaying(true);
      }
    }
  };

  return (
    <div className="group/PlaylistCard relative flex items-center bg-white/5 backdrop-blur-md hover:bg-white/8 rounded-md  transition group cursor-pointer z-10 truncate w-full">
      <Link href={`/playlists/${props.index}`}>
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
        className={`absolute right-2  p-2 bg-green-500 rounded-full ${conditionCheck && Context_isPlaying.isPlaying ? 'visible' :'invisible'} group-hover/PlaylistCard:visible text-black`}
        onClick={() => {
          handlePlayFromType(props.item.type, props.item._id);
        }}
      >
        {conditionCheck ==true && Context_isPlaying.isPlaying ? (
          <IoIosPause className="text-2xl  cursor-pointer" />
        ) : (
          <IoIosPlay className="text-2xl pl-0.5 cursor-pointer" />
        )}
      </div>
      <div className="ml-auto mr-5 group-hover/PlaylistCard:hidden">
        {conditionCheck== true &&
          Context_isPlaying.isPlaying && <Pillers />}
      </div>
    </div>
  );
};

const GridCellContainer = () => {

  const {playlists} = usePlaylists();

  return(
 <>
  {
    playlists !== null && 
      <>
        <div className="px-5 pt-2 ">
          <div className="grid grid-cols-2  sm:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]  gap-4">
            {playlists?.slice(0, 8).map((pl, idx) => (
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
