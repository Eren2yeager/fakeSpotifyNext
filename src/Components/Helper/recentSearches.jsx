import React, { useEffect, useState, useContext, useRef } from "react";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import { IoAddOutline } from "react-icons/io5";
import Pillers from "./pillers";
import { usePlayer } from "@/Contexts/playerContext";

export const RecentSearchSongCard = (props) => {
  // these are contexts to control song
  const { handlePlayFromType } = usePlayer();
  const [conditionCheck, setConditionCheck , isPlaying] = useState(false);

  const handlePlayPause = async (item) => {
    setConditionCheck(handlePlayFromType(item));
  };

  return (
    <div className="relative playlist-card flex bg-zinc-800 hover:bg-zinc-700 h-[60px] p-1 my-1 rounded-xl cursor-pointer group">
      <div className="relative min-w-[50px] min-h-[50x] bg-zinc-900 rounded-xl">
        <img
          src={props.item.image || "/images/notfound.png"}
          className=" w-full h-full object-cover rounded-xl group-hover:opacity-40"
          alt=""
        />
        <span
          onClick={() => {
            handlePlayPause(props.item);
          }}
          className="absolute top-1/4 right-1/4 invisible group-hover:visible"
        >
          {conditionCheck && isPlaying ? (
            <IoIosPause className="text-2xl cursor-pointer" />
          ) : (
            <IoIosPlay className="text-2xl cursor-pointer" />
          )}
        </span>
        <span className="absolute top-1/4 right-1/4 group-hover:hidden"></span>
      </div>
      <div className="w-full flex-col justify-center items-start flex  px-2 pr-3 truncate">
        <div
          className={`max-w-[100%] justify-start text-[14px] font-bold truncate ${
            conditionCheck && "text-green-500"
          }  `}
        >
          <div className="flex">
            {conditionCheck && isPlaying && (
              <div className="flex">
                <Pillers />
                &nbsp;&nbsp;
              </div>
            )}
            {props.item.name || "song-Name"}
          </div>
        </div>
        <div className=" text-xs max-w-[100%] truncate justify-start opacity-50  ">
          {props.item.artist?.name || "artist-Name"}
        </div>
      </div>
      <div className="z-10 h-[100%] w-[35px] rounded-r-2xl  ml-auto cursor-pointer transition-all duration-200">
        <div
          className="transform rotate-45 active:scale-90 p-0.5 hover:scale-125 absolute right-0 top-1/4 px-2 sm:invisible sm:group-hover:visible"
          onClick={() => {
            props.handleDelete(props.item)
          }}
        >
          <IoAddOutline className="text-3xl  sm:text-white " />
        </div>
      </div>
    </div>
  );
};

const RecentSearches = () => {
  const [recentSearches, setRecentSearches] = useState(null);

  let recentSearchesArray = [];
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentSearchesArray");
      if (stored) {
        recentSearchesArray = JSON.parse(stored);
      }
    } catch (e) {
      // If parsing fails, reset to empty array
      recentSearchesArray = [];
    }
    setRecentSearches(recentSearchesArray);
  }, []);

  const handleDelete = (itemToDelete) => {
    setRecentSearches((prev) => {
      // Use _id for comparison to avoid reference issues
      const updated = prev.filter((item) => item._id !== itemToDelete._id);
      localStorage.setItem("recentSearchesArray", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <>
      {recentSearches?.length > 0 && (
        <div className="absolute top-full  left-0 right-0 z-50  mt-2 h">
          <div className="p-4  bg-zinc-800 text-white rounded-lg shadow-lg max-h-80 overflow-y-auto">
            <div className="font-bold ">Recent searches</div>
            <ul>
              {recentSearches?.map((item, index) => (
                <li
                  key={index}
                  className="py-1 last:border-none cursor-pointer"
                >
                  <RecentSearchSongCard
                    item={item}
                    index={index}
                    handleDelete={handleDelete}
                  />
                </li>
              ))}
            </ul>
            <button
              className="px-3 py-1 w-fit font-bold border-1 rounded-full cursor-pointer"
              onClick={() => {
                setRecentSearches(() => {
                  // Use _id for comparison to avoid reference issues
                  const updated = []
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
