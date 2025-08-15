
"use client";
import React, { useEffect, useState } from "react";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { IoAddOutline } from "react-icons/io5";
import Pillers from "./pillers";
import { usePlayer } from "@/Contexts/playerContext";
import { useRouter } from "next/navigation";

// Helper to determine if item is an Artist or Profile for rounded image
const isRounded = (type) => type === "Artist" || type === "Profile";

// Card for any recent item, with play button and correct image UI
export const RecentSearchItemCard = ({ item, handleDelete }) => {
  const router = useRouter();
  const {
    handlePlayFromType,
    conditionCheckForSong,
    isPlaying,
    currentSong,
    context,
  } = usePlayer();

  // Determine if this item is currently playing
  const conditionCheck = conditionCheckForSong(item);

  // For Song: play the song. For others (except Profile): play first song in collection
  const handlePlayPause = (e) => {
    e.stopPropagation();
    // For non-song, non-profile, play first song in collection
    if (item.type == "Song" ||  (item.type !== "Profile" && item.songs && item.songs.length > 0)) {
      handlePlayFromType(item);
    } 
  };

  // For Song: show artist name, for others: show type or other info
  const subtitle =
    item.type === "Song"
      ? `${item?.type} • ${item.artist?.name}` || "artist-Name"

      : item.type;

  // Card content (image, play button, info, delete)
  const cardContent = (
    <div className="relative playlist-card flex bg-zinc-800 hover:bg-zinc-700 h-[60px] p-1 my-1 rounded-xl cursor-pointer group">
      <div className={`relative min-w-[50px] min-h-[50px] bg-zinc-900  flex items-center justify-center ${isRounded(item.type) ? "rounded-full" : "rounded-xl"}`}>
        <img
          src={item.image || "/images/notfound.png"}
          className={`w-full h-full object-cover  group-hover:opacity-40 ${isRounded(item.type) ? "rounded-full" : "rounded-xl"}`}
          alt=""
        />
        {/* Play button on hover, only for Song and other types except Profile */}
        {item.type !== "Profile" && ((item.type === "Song") || (item.songs && item.songs.length > 0)) && (
          <span
            onClick={handlePlayPause}
            className="absolute top-1/4 right-1/4 invisible group-hover:visible"
          >
            {conditionCheck  && isPlaying ? (
              <IoIosPause className="text-2xl cursor-pointer" />
            ) : (
              <IoIosPlay className="text-2xl cursor-pointer" />
            )}
          </span>
        )}
        <span className="absolute top-1/4 right-1/4 group-hover:hidden"></span>
      </div>
      <div className="w-full flex-col justify-center items-start flex px-2 pr-3 truncate">
        <div
          className={`max-w-[100%] justify-start text-[14px] font-bold truncate ${
            conditionCheck && isPlaying ? "text-green-500" : ""
          }`}
        >
          <div className="flex">
            {conditionCheck && isPlaying && (
              <div className="flex">
                <Pillers />
                &nbsp;&nbsp;
              </div>
            )}
            {item.name || "song-Name"}
          </div>
        </div>
        <div className="text-xs max-w-[100%] truncate justify-start opacity-50">
          {subtitle}
        </div>
      </div>
      <div className="z-10 h-[100%] w-[35px] rounded-r-2xl ml-auto cursor-pointer transition-all duration-200">
        <div
          className="transform rotate-45 active:scale-90 p-0.5 hover:scale-125 absolute right-0 top-1/4 px-2 sm:invisible sm:group-hover:visible"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(item);
          }}
        >
          <IoAddOutline className="text-3xl sm:text-white" />
        </div>
      </div>
    </div>
  );

  // For Song: just render the card, no navigation
  if (item.type === "Song") {
    return cardContent;
  }

  // For others: use router.push on click, not Link, to avoid full reload
  return (
    <div
      onClick={() => {
        router.push(`/${item.type?.toLowerCase()}s/${item._id}`);
      }}
      style={{ cursor: "pointer" }}
    >
      {cardContent}
    </div>
  );
};

const RecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState(null);

  useEffect(() => {
    let recentSearchesArray = [];
    try {
      const stored = localStorage.getItem("recentSearchesArray");
      if (stored) {
        recentSearchesArray = JSON.parse(stored);
      }
    } catch (e) {
      recentSearchesArray = [];
    }
    setRecentSearches(recentSearchesArray);
  }, []);

  const handleDelete = (itemToDelete) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item._id !== itemToDelete._id);
      localStorage.setItem("recentSearchesArray", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <>
      {recentSearches?.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2">
          <div className="p-4 bg-zinc-800 text-white rounded-lg shadow-lg max-h-80 overflow-y-auto">
            <div className="font-bold">Recent searches</div>
            <ul>
              {recentSearches?.map((item, index) => (
                <li key={index} className="py-1 last:border-none">
                  <RecentSearchItemCard item={item} handleDelete={handleDelete} />
                </li>
              ))}
            </ul>
            <button
              className="px-3 py-1 w-fit font-bold border-1 rounded-full cursor-pointer"
              onClick={() => {
                setRecentSearches(() => {
                  const updated = [];
                  localStorage.setItem("recentSearchesArray", JSON.stringify(updated));
                  return updated;
                });
              }}
            >
              Clear recent searches
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(RecentSearches);
