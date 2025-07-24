import React, { useState, useRef, useEffect, useContext } from "react";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import { isPlayingContext, audioRefContext } from "../../Contexts/contexts";
import { usePlayer } from "../../Contexts/playerContext";
const ArtistCard = (props) => {
    const Context_isPlaying = useContext(isPlayingContext);
    const Context_audio_ref = useContext(audioRefContext);
  
    const { handlePlayFromType} = usePlayer();
    const [conditionCheck , setConditionCheck] =useState(false)
  
    const handlePlayPause = async (item) => {
      setConditionCheck( handlePlayFromType(item))
    };
    return (
      <div className="p-2 rounded-[5px] group hover:bg-gradient-to-b from-white/8 to-transparent cursor-pointer transition-all duration-300 relative active:bg-white/15">
        <div className=" w-[120px] sm:w-[180px]  overflow-hidden  m-1  ">
          <div className="w-[100%] h-[120px] sm:h-[180px] ">
            <img
              className="w-[100%] h-[100%] object-cover rounded-full  shadow-lg shadow-gray-950"
              src={`${props.item.image || "/images/notfound.png"}`}
              alt=""
            />
          </div>
          <div className="flex flex-col mt-2 h-[30%] w-[100%] justify-start text-xs sm:text-[1em] ">
            <div
              className="song-name text-wrap   overflow-hidden text-ellipsis break-words "
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}
            >
              {props.item.name}
            </div>
            {/* <div className="song-artist  lg:text-wrap max-w-[95%]  lg:max-h-[3em] overflow-hidden truncate opacity-70 text-[0.7em]">
              {props.artistName}
            </div> */}
          </div>
          <span className={`p-3  rounded-full bg-green-500  absolute ${conditionCheck && Context_isPlaying.isPlaying ?  "bottom-[30%]" : "bottom-0 opacity-0"} right-[10%]  group-hover:bottom-[30%] group-hover:opacity-100 transition-all duration-300 active:transform-[scale(0.95)]`}
                        onClick={() => {
                          handlePlayFromType(props.item.type, props.item._id)
                          }}
          
          >
            <span

            >
              {/* <IoIosPlay className='text-3xl pl-1  invert'/> */}
              <span>
                {conditionCheck
                  && Context_isPlaying.isPlaying ? (
                  <IoIosPause className="text-3xl  text-black cursor-pointer" />
                ) : (
                  <IoIosPlay className="text-3xl pl-0.5 text-black cursor-pointer" />
                )}
              </span>
            </span>
          </span>
          {/* <img className="w-[25%] h-[25%] absolute bottom-0 right-[10%] opacity-0 group-hover:bottom-[35%] group-hover:opacity-100 transition-all duration-300" src="\src\images\playButton.svg" alt="" /> */}
        </div>
      </div>
    );
  };

export default React.memo(ArtistCard)