import React, { useState, useRef, useEffect, useContext } from "react";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import { usePlayer } from "../../Contexts/playerContext";
import { useRouter } from "next/navigation";
const TopResultCard = (props) => {
  const {handlePlayFromType, conditionCheckForSong, currentSong, isPlaying , setIsPlaying , durationRef , currentTimeRef , audioRef} = usePlayer();
  
  const conditionCheck = conditionCheckForSong(props.item);
  const router = useRouter()

 const handleclick = () => {
    if (props.item.type === "Album") {
      router.push(`/albums/${props.item._id}`);
    } else if (props.item.type === "Artist") {
      router.push(`/artists/${props.item._id}`);
    } else if (props.item.type === "Playlist") {
      router.push(`/playlists/${props.item._id}`);
    } else if (props.item.type === "Profile") {
      router.push(`/profiles/${props.item._id}`);
    }
    // Do nothing for "Song"
  }
  return (
    <div className="p-4 rounded-[5px] w-full   h-full group hover:bg-gradient-to-b bg-white/5 to-transparent cursor-pointer transition-all duration-300 relative active:bg-white/15"
    
    onClick={handleclick}
    >
      <div className=" max-w-[500px]  overflow-hidden    ">
        <div
          className={`max-w-[130px]  h-[130px] ${
            props.item.type == "Artist" || props.item.type == "Profile"
              ? "rounded-full"
              : "rounded-[5px]"
          } overflow-hidden `}
        >
          <img
            className="w-[100%] h-[100%] object-cover rounded-[5px]  shadow-lg shadow-gray-950"
            src={`${props.item.image}`}
            alt=""
          />
        </div>
        <div className="flex flex-col mt-2 h-[30%] w-[100%] justify-start font-sans ">
          <div
            className="song-name text-wrap text-2xl font-bold  overflow-hidden text-ellipsis break-words "
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {props.item?.name}
          </div>
          <div className="song-artist  lg:text-wrap max-w-[95%] text-[0.8em] font-semibold font-sans overflow-hidden truncate opacity-70 ">
            {`${props.item.type}`}

            {`${
              props.item.type == "Song"
                ? ` • ${props.item.artist?.name || "Unknown Artist"}`
                : props.item.type == "Playlist"
                ? ` • ${props.item?.createdBy?.name || "Unknown User"}`
                : props.item.type == "Album"
                ? ` • ${props.item?.artist?.name || "Unknown Artist"}`
                : (props.item.type == "Artist" ||
                    props.item.type == "Profile") &&
                  ""
            }`}
          </div>
        </div>
        {props.item.type !== "Profile" &&
          (props.item.type === "Song" ? (
            <span
              className={`p-3  rounded-full bg-green-500  absolute ${
                conditionCheck && isPlaying
                  ? "bottom-[5%]"
                  : "bottom-0 opacity-0"
              }  right-[5%]  group-hover:bottom-[5%] group-hover:opacity-100 transition-all duration-300 active:transform-[scale(0.95)]`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault()
                handlePlayFromType(props.item);
              }}
            >
              <span>
                {/* <IoIosPlay className='text-3xl pl-1  invert'/> */}
                <span>
                  {conditionCheck && isPlaying ? (
                    <IoIosPause className="text-3xl  text-black cursor-pointer" />
                  ) : (
                    <IoIosPlay className="text-3xl pl-0.5 text-black cursor-pointer" />
                  )}
                </span>
              </span>
            </span>
          ) : (
            props.item?.songs?.length > 0 && (
              <span
                className={`p-3  rounded-full bg-green-500  absolute ${
                  conditionCheck && isPlaying
                    ? "bottom-[5%]"
                    : "bottom-0 opacity-0"
                }  right-[5%]  group-hover:bottom-[5%] group-hover:opacity-100 transition-all duration-300 active:transform-[scale(0.95)]`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayFromType(props.item);
                }}
              >
                <span>
                  {/* <IoIosPlay className='text-3xl pl-1  invert'/> */}
                  <span>
                    {conditionCheck && isPlaying ? (
                      <IoIosPause className="text-3xl  text-black cursor-pointer" />
                    ) : (
                      <IoIosPlay className="text-3xl pl-0.5 text-black cursor-pointer" />
                    )}
                  </span>
                </span>
              </span>
            )
          ))}

        {/* <img className="w-[25%] h-[25%] absolute bottom-0 right-[10%] opacity-0 group-hover:bottom-[35%] group-hover:opacity-100 transition-all duration-300" src="\src\images\playButton.svg" alt="" /> */}
      </div>
    </div>
  );
};

export default React.memo(TopResultCard);
