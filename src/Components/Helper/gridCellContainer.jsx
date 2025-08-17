"use client";
import React, { useEffect, useState, useContext } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import { usePlayer } from "@/Contexts/playerContext";
import { useLibrary } from "@/Contexts/libraryContext";
import Pillers from "@/Components/Helper/pillers";
const RecentPlayCard = (props) => {
  const router = useRouter();

  // to play the song from playlist or just a song
  const {
    handlePlayFromType,
    conditionCheckForSong,
    currentSong,
    context,
    isPlaying,
    audioRef,
    setIsPlaying,
  } = usePlayer();

  // it will tell the what is currenty playlist
  const conditionCheck = conditionCheckForSong(props.item);

  return (
    <div className="group/PlaylistCard relative flex items-center bg-white/5 backdrop-blur-md hover:bg-white/8 rounded-md  transition group cursor-pointer z-10 truncate w-full">
        <div
          className="flex gap-3 items-center overflow-clip"
          onClick={() => {
            props.item.type !== "Song" ? 
              router.push(
                `/${props.item.type.toLowerCase()}s/${props.item._id}`
              ) :  handlePlayFromType(props.item);

            
          }}
        >
          <img
            src={props.item.image}
            alt={props.item.name}
            className="w-12 h-12 rounded-sm object-cover"
          />
          <p
            className={`text-wrap max-w-[95%]  overflow-hidden text-ellipsis break-words text-[0.7em] sm:text-[1em] pr-2  font-sans  truncate max-w-auto ${
              conditionCheck ? `text-green-500` : `text-white`
            } `}
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {props.item?.name}
          </p>
        </div>

      {((props.item.type !== "Song"  && props.item.songs?.length > 0)  || props.item.type == "Song") && (
        <div
          className={`absolute right-2  p-2 bg-green-500 rounded-full  group-hover/PlaylistCard:visible invisible text-black`}
          onClick={() => {
            handlePlayFromType(props.item);
          }}
        >
          {conditionCheck == true && isPlaying ? (
            <IoIosPause className="text-lg  sm:text-2xl  cursor-pointer" />
          ) : (
            <IoIosPlay className="text-lg  sm:text-2xl  cursor-pointer" />
          )}
        </div>
      )}
      <div className="ml-auto mr-5 group-hover/PlaylistCard:hidden">
        {conditionCheck == true && isPlaying && <Pillers />}
      </div>
    </div>
  );
};

const GridCellContainer = () => {
  const { library } = useLibrary();
  const [recents, setRecents] = useState(null);

  useEffect(() => {
    fetch("/api/recents")
      .then((res) => res.json())
      .then((data) => setRecents(data.recents))
      .catch(() => {});
  }, []);

  // Helper to flatten and tag each type
  const flattenWithType = (arr, type, key) =>
    (arr || []).map((item) => ({
      ...item[key], // spread the actual object (song, album, etc.)
      type,
      playedAt: item.playedAt,
      songs: item.songs,
    }));

  // Flatten all types
  const allRecents = [
    ...flattenWithType(recents?.songs, "Song", "song"),
    ...flattenWithType(recents?.albums, "Album", "album"),
    ...flattenWithType(recents?.artists, "Artist", "artist"),
    ...flattenWithType(recents?.playlists, "Playlist", "playlist"),
  ];

  // Sort by playedAt descending (most recent first)
  // Sort recents so the most recently played items appear first
  allRecents.sort(
    (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
  );


  return (
    <>
      {allRecents.length > 0 && (
        <div className="px-5 pt-2 ">
          <div className="grid grid-cols-2  sm:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]  gap-4">
            {allRecents.slice(0, 8).map((item, idx) => (
              <RecentPlayCard key={idx} index={idx} item={item} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(GridCellContainer);
