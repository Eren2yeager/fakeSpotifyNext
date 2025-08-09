import React, { useState, useRef, useEffect, useContext } from "react";
import {
  ToggleFullScreenContext,
  showRightContext,

  showPlaylistsContext,
} from "../../Contexts/contexts";
import LiveSeekbar from "../audioComponents/LiveSeekbar";
import { IoMdAddCircleOutline } from "react-icons/io";
import { TiTick } from "react-icons/ti";
import { CiCircleChevDown } from "react-icons/ci";
import { CiCircleChevUp } from "react-icons/ci";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import MarqueeDiv from "/src/Components/Helper/marquee";

import TickOrAdd from "../Helper/TickOrAdd";

import { useTransition } from "react";
import { usePlayer } from "@/Contexts/playerContext";
const RectangularSongCard = (props) => {
  const ContextFullScreen = useContext(ToggleFullScreenContext);
  const ContextShowRight = useContext(showRightContext);
  const ContextShowPlaylists = useContext(showPlaylistsContext);
  const { currentSong,  context, play , isPlaying , setIsPlaying ,audioRef} = usePlayer();
  const handlePlayPause = (e) => {
    e.stopPropagation();

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleClick = () => {
    if (ContextFullScreen.toggleFullScreen) {
      ContextFullScreen.settoggleFullScreen(false);
      ContextShowRight.setShowRight(true);
      if (window.innerWidth <= 1280) {
        ContextShowPlaylists.setShowPlaylists(false);
      }
    } else {
      ContextShowRight.setShowRight(!ContextShowRight.showRight);
      if (window.innerWidth <= 1280) {
        ContextShowPlaylists.setShowPlaylists(false);
      }
    }
  };





  return (
    <div className="flex flex-col items- justify-center w-[100%]">
      <div
        className={`relative flex flex-col  justify-center  rounded-lg h-[70px] p-1         
     `}
        style={{ background: `${props.bgColor}` }}
      >
        <div
          className={`playlist-card flex ${props.className} items-center bg-gradient-to-tr max-w-[100%] p-1 `}
        >
          <div className="max-w-[80%] flex justify-start items-center">
            <div className="group min-w-[50px] h-[50px] bg-zinc-900 rounded-lg relative">
              <img
                src={props.song?.image || "/images/notfound.png"}
                className=" w-[100%] h-[100%] object-cover rounded-lg"
                alt=""
              />

              {/* // show right button */}
              {props.showRightButton && (
                <div className="hidden sm:block invisible group-hover:visible transition-all duration-300 hover:animate-pulse ">
                  {ContextShowRight.showRight ? (
                    <CiCircleChevDown
                      className="absolute bottom-1/3 right-1/4 bg-zinc-700 rounded-full text-3xl cursor-pointer"
                      onClick={handleClick}
                    />
                  ) : (
                    <CiCircleChevUp
                      className="absolute bottom-1/3 right-1/4 bg-zinc-700 rounded-full text-3xl cursor-pointer"
                      onClick={handleClick}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="max-w-[100%] flex-col justify-center items-start flex  px-2 truncate">
              {/* // want marquee or elipsis */}
              {props.marquee?.show ? (
                <>
                  <MarqueeDiv text={props.song?.name || ""} />

                  <MarqueeDiv
                    text={props.song?.artist?.name || ""}
                    className="text-[0.8em] opacity-70 "
                  />
                </>
              ) : (
                <>
                  <div className="max-w-[100%] justify-start text-[14px] truncate">
                    {props.song?.name || "prop not provided"}
                  </div>
                  <div className="max-w-[100%] justify-start text-[14px] truncate">
                    {props.song?.artist?.name || "prop not provided"}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="max-w-[20%]  flex gap-2 justify-between items-center p-2">
            {/* show add to library button */}
            {(props.showAddTolibraryButton && props.song) && (
                  <TickOrAdd song={props.song}/>
            )}

            {/* show play button */}
            {props.showPlayButton && (

                <span className="cursor-pointer block sm:hidden" onClick={handlePlayPause}>
                  {isPlaying ? (
                    <IoIosPause
                      className=" text-white self-center text-4xl "
                      title="Pause"
                    />
                  ) : (
                    <IoIosPlay
                      className=" text-white self-center text-4xl pl-[2px]"
                      title="Play"
                    />
                  )}
                </span>
            )}
          </div>
        </div>

        {/* show audio component */}
        {props.showAudioComponent && (
          <div className="sticky bottom-0 w-[98%] sm:hidden  pb-1 justify-start self-center">
            <LiveSeekbar
              wantControls={false}
              wantThumb={false}
              showTime={false}
              width={`w-[100%]`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(RectangularSongCard);

// props to give
// 1. imageUrl
// 2. songName
// 3. artistName
// 4. marquee - {show:true/false, fadeColor:"from-color"}
// 5. showAddTolibraryButton
// 6. showPlayButton
// 7. showAudioComponent
// 8. showRightButton
// 9.fromGradient
