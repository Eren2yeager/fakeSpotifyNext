"use client"

import React from "react";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import { usePlayer } from "../../Contexts/playerContext";
import { useRouter, usePathname } from "next/navigation";

const AlbumCard = (props) => {
  const { handlePlayFromType, conditionCheckForSong, isPlaying } = usePlayer();
  const conditionCheck = conditionCheckForSong(props.item);
  const router = useRouter();
  const pathname = usePathname();

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

  return (
    <div
      className="p-2 rounded-[5px] group hover:bg-white/8 cursor-pointer transition-all duration-300 relative active:bg-white/15"
      onClick={(e) => {
        updateRecentSearchesIfSearchRoute();
        router.push(`/albums/${props.item._id}`);
      }}
    >
      <div className=" w-[95px] sm:w-[150px]  overflow-hidden  m-1  ">
        <div className="w-[100%] h-[95px] sm:h-[150px] ">
          <img
            className="w-[100%] h-[100%] object-cover rounded-[5px]  shadow-lg shadow-gray-950"
            src={`${props.item?.image || "/images/notfound.png"}`}
            alt=""
          />
        </div>
        <div className="flex flex-col mt-2 h-[30%] w-[100%] justify-start text-xs sm:text-[1em] ">
          <div
            className=" text-wrap   overflow-hidden text-ellipsis break-words "
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {props.item?.name}
          </div>
          <div className=" lg:text-wrap max-w-[95%]  lg:max-h-[3em] overflow-hidden truncate opacity-70 text-[0.7em]">
            {props.item?.type}
          </div>
        </div>
        {props.item?.songs?.length > 0 && (
          <span
            className={`p-3  rounded-full bg-green-500  absolute ${
              conditionCheck && isPlaying
                ? "bottom-[30%]"
                : "bottom-0 opacity-0"
            }  right-[15%]  group-hover:bottom-[30%] group-hover:opacity-100 transition-all duration-300 active:transform-[scale(0.95)]`}
            onClick={(e) => {
              e.stopPropagation();
              updateRecentSearchesIfSearchRoute();
              handlePlayFromType(props.item);
            }}
          >
            <span>
              <span>
                {conditionCheck && isPlaying ? (
                  <IoIosPause className="text-3xl  text-black cursor-pointer" />
                ) : (
                  <IoIosPlay className="text-3xl pl-0.5 text-black cursor-pointer" />
                )}
              </span>
            </span>
          </span>
        )}
      </div>
    </div>
  );
};

export default React.memo(AlbumCard);
