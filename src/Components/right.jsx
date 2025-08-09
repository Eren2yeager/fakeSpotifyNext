import React, { useState, useContext, useRef, useEffect } from "react";
import {
  ToggleFullScreenContext,
  showRightContext,
} from "../Contexts/contexts";
import MarqueeDiv from "./Helper/marquee";
import { BsThreeDots } from "react-icons/bs";
import SuggestBgColor from "../functions/bgSuggester";
import { motion } from "framer-motion";

import { IoIosPlay } from "react-icons/io";
import { GoScreenFull } from "react-icons/go";
import { GoScreenNormal } from "react-icons/go";
import ShowMoreShowLess from "./Helper/showMoreShowLess";
import EndMiddle from "./endbars/endMiddle";
import { IoIosArrowDown } from "react-icons/io";
import NotFound from "./Helper/not-found";
import { TiTick } from "react-icons/ti";
import { usePlayer } from "../Contexts/playerContext";
import ThreeDots from "./Helper/ThreeDots";
import TickOrAdd from "./Helper/TickOrAdd";
import { useRouter } from "next/navigation";
import QueueAndRecentsSide from "./audioComponents/QueueAndRecents";
import { HiQueueList } from "react-icons/hi2";
import { HiOutlineQueueList } from "react-icons/hi2";
import Followbutton from "./artistsComponents/followbutton";
import { useSession } from "next-auth/react";
const PlayCard = (props) => {
  return (
    <div className="playlist-card flex  justify-between items-center  bg-zinc-800 h-[75px] p-2  rounded-xl hover:bg-zinc-700 group/playcard my-2">
      <div className="flex  justify-start items-center max-w-[90%]">
        <div className="group max-w-[60px] max-h-[60x] bg-zinc-800 rounded-xl relative">
          <img
            src={props.imageUrl || "/images/notfound.png"}
            className=" w-[100%] h-[100%] object-contain rounded-xl group-hover/playcard:opacity-60"
            alt=""
          />
          <IoIosPlay className="absolute bottom-1/4 left-1/4 text-3xl hidden group-hover/playcard:block active:transform-[scale(0.9)] hover:animate-pulse" />
        </div>

        <div className="max-w-[100%] flex-col justify-start items-start flex  px-2 truncate">
          <MarqueeDiv
            text={props.songName || "prop not provided"}
            className="font-bold "
            containerWidth={`max-w-[100%]`}
          />
          <MarqueeDiv
            text={props.artistName || "prop not provided"}
            className="text-[0.8em] opacity-70 "
            containerWidth={`max-w-[100%]`}
          />
        </div>
      </div>

      <div className="flex justify-center gap-3 items-center p-2 hover:animate-pulse active:transform-[scale(0.9)] invisible group-hover/playcard:visible">
        <TiTick
          className="bg-pink-400 rounded-full invert animate-pulse cursor-pointer"
          size={20}
        />
        <BsThreeDots className="text-xl" />
      </div>
    </div>
  );
};

const Right = () => {
  const ContextFullScreen = useContext(ToggleFullScreenContext);
  const ContextShowRight = useContext(showRightContext);
  const rightNavRef = React.useRef(null);
  const SongImageRef = useRef(null);
  const ArtistImageRef = useRef(null);
  const containerRef = useRef(null);
  const popupRef = useRef(null);

  const [selectedSong, setSelectedSong] = useState(null);
  const [bgColor, setBgColor] = useState(null);
  const { currentSong, context, openQueue, setOpenQueue } = usePlayer();
  const router = useRouter();
  const { data: session } = useSession();
  const [isUpdated, setIsUpdated] = useState(false);
  useEffect(() => {
    setIsUpdated(false);
    if (!currentSong) return;

    setSelectedSong(currentSong);
    const setBG = async () => {
      if (!currentSong?.image) return;

      try {
        const color = await SuggestBgColor(currentSong.image);

        setBgColor(color); // or color.rgb
      } catch (err) {
        console.log("Error getting average color:", err);
      }
    };
    setBG();
  }, [currentSong, selectedSong, isUpdated]);

  // for scrolling effect in above sm

  const handleScroll = React.useCallback((e) => {
    const target = e.target;
    if (target.scrollTop > 0) {
      rightNavRef.current.classList.add("shadow-xl", "shadow-gray-950");
      rightNavRef.current.classList.remove("bg-transparent");

      if (ContextFullScreen.toggleFullScreen) {
        SongImageRef.current.classList.add("transform", "scale-90", "blur-xs");
        ArtistImageRef.current.classList.add(
          "transform",
          "translate-y-[-100px]"
        );
      } else {
        SongImageRef.current.classList.remove(
          "transform",
          "scale-90",
          "blur-xs"
        );
        ArtistImageRef.current.classList.remove(
          "transform",
          "translate-y-[-100px]"
        );
      }
    } else {
      rightNavRef.current.classList.remove("shadow-xl", "shadow-gray-950");
      rightNavRef.current.classList.add("bg-transparent");

      SongImageRef.current.classList.remove("transform", "scale-90", "blur-xs");
      ArtistImageRef.current.classList.remove(
        "transform",
        "translate-y-[-100px]"
      );
    }
  });
  const handleClick = (e) => {
    if (ContextFullScreen.toggleFullScreen) {
      ContextFullScreen.settoggleFullScreen(false);
      // ContextShowRight.setShowRight(false);
    } else {
      ContextShowRight.setShowRight(!ContextShowRight.showRight);
    }
  };

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateListener = () => {
      if (window.innerWidth >= 640) {
        container.addEventListener("scroll", handleScroll);
      } else {
        container.removeEventListener("scroll", handleScroll);
      }
    };

    updateListener(); // run on mount
    window.addEventListener("resize", updateListener);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateListener);
    };
  });

  return (
    // ... (other imports above, keep as is)

    // ... inside your component, before return:

    // ... in your return:
    <div className="relative w-full h-full flex gap-1 transition-all duration-300 ">
      <motion.div
        ref={popupRef}
        initial={
          typeof window !== "undefined" &&
          window.innerWidth <= 640 && { y: 300, opacity: 0 }
        }
        exit={
          typeof window !== "undefined" &&
          window.innerWidth <= 640 && { y: -200, opacity: 0 }
        }
        animate={
          typeof window !== "undefined" &&
          window.innerWidth <= 640 && { y: 0, opacity: 1 }
        }
        transition={
          typeof window !== "undefined" &&
          window.innerWidth <= 640 && { duration: 0.7, ease: "easeOut" }
        }
        drag={
          typeof window !== "undefined" && window.innerWidth <= 640
            ? "y"
            : false
        }
        dragConstraints={{ top: 0, bottom: 300 }}
        onDragEnd={(event, info) => {
          if (
            typeof window !== "undefined" &&
            window.innerWidth <= 640 &&
            info.offset.y > 100
          ) {
            setTimeout(() => {
              ContextFullScreen.settoggleFullScreen(false);
              ContextShowRight.setShowRight(false);
            }, 1000);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
        }}
        className={`text-white right group/right flex flex-col  justify-start ${
          ContextFullScreen.toggleFullScreen ? `w-[100%]` : `w-[100%] `
        }  h-[100%] bg-zinc-900 rounded-sm   relative   overflow-y-auto ${
          ContextShowRight.showRight ? "block" : "hidden"
        } transition-all duration-1000 `}
        style={{
          background: `linear-gradient(0deg,#19191b , ${bgColor} )`,
        }}
      >
        {currentSong == null ? (
          <>
            <div
              className=" flex gap-3   h-[60px] py-3   px-3 transition-all duration-200 relative"
              ref={rightNavRef}
            >
              <div
                className="transition-all duration-100 cursor-pointer  sm:block transform sm:translate-x-[-40px] sm:group-hover/right:translate-x-[0px]"
                id="toggle-right"
                onClick={handleClick}
              >
                {" "}
                <span className="hidden sm:block ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="25px"
                    viewBox="0 -960 960 960"
                    width="25px"
                    fill="#e3e3e3"
                  >
                    <path d="M500-640v320l160-160-160-160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm120-80v-560H200v560h120Zm80 0h360v-560H400v560Zm-80 0H200h120Z" />
                  </svg>
                </span>
                <span className="sm:hidden ">
                  <IoIosArrowDown className="text-2xl" />
                </span>
              </div>
            </div>
            <NotFound
              text={"Find something to play"}
              icon={
                <lord-icon
                  src="https://cdn.lordicon.com/zxaptliv.json"
                  trigger="loop"
                  delay="3000"
                  stroke="bold"
                  colors="primary:#ffffff,secondary:#30e849"
                  style={{ width: "200px", height: "200px" }}
                ></lord-icon>
              }
              buttonText={"Search"}
              position={"center"}
              buttonOnClick={() => {
                router.push("/search");
                ContextFullScreen.settoggleFullScreen(false);
              }}
            />
          </>
        ) : (
          <>
            <div
              className=" flex gap-3   h-[60px] py-3   px-3 transition-all duration-200 "
              ref={rightNavRef}
            >
              <div
                className="transition-all duration-100 cursor-pointer  sm:block transform sm:translate-x-[-40px] sm:group-hover/right:translate-x-[0px]"
                id="toggle-right"
                onClick={handleClick}
              >
                {" "}
                <span className="hidden sm:block ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="25px"
                    viewBox="0 -960 960 960"
                    width="25px"
                    fill="#e3e3e3"
                  >
                    <path d="M500-640v320l160-160-160-160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm120-80v-560H200v560h120Zm80 0h360v-560H400v560Zm-80 0H200h120Z" />
                  </svg>
                </span>
                <span className="sm:hidden ">
                  <IoIosArrowDown className="text-2xl" />
                </span>
              </div>

              <div className="font-bold transform sm:translate-x-[-35px] group-hover/right:translate-x-[-0px] transition-all duration-150 mr-auto max-w-full truncate">
                <MarqueeDiv text={context.name || ""} />
              </div>
              <div className=" max-h-[100%] justify-center items-center rounded-full flex font-bold  transition-all duration-100  gap-2">
                <div className="sm:hidden group-hover/right:block max-h-[100%] flex items-center">
                  <ThreeDots
                    song={currentSong}
                    playlistId={
                      context.type == "Playlist" ? context.id : undefined
                    }
                  />
                </div>
                <span
                  className="max-h-[100%] transition-all duration-300 hover:backdrop-blur-lg hidden sm:group-hover/right:block hover:bg-white/8  rounded-full "
                  onClick={() => {
                    ContextFullScreen.settoggleFullScreen(
                      !ContextFullScreen.toggleFullScreen
                    );
                  }}
                >
                  {ContextFullScreen.toggleFullScreen ? (
                    <GoScreenNormal className="text-lg" title="FullScreen" />
                  ) : (
                    <GoScreenFull className="text-lg" title="FullScreen" />
                  )}
                </span>
              </div>
            </div>

            <div
              className="  sm:overflow-y-auto w-[100%]   flex flex-col items-center justify-between  px-3 transition-all duration-500 pb-40 sm:pb-0"
              ref={containerRef}
            >
              <div
                className={`song-image flex flex-col justify-around  w-[100%] max-w-[400px] min-h-[85vh] ${
                  ContextFullScreen.toggleFullScreen
                    ? "sm:min-h-[80vh] sm:justify-center"
                    : "sm:min-h-auto sm:justify-start"
                }  rounded-xl transition-all duration-500 `}
                ref={SongImageRef}
              >
                <img
                  className="w-[100%]  object-cover rounded-xl transition-all duration-500 shadow-xl shadow-gray-950"
                  src={`${selectedSong?.image || `/images/notfound.png`}`}
                  alt=""
                />
                <div className="w-[100%] max-w-[400px]">
                  <div
                    className={`song-info max-w-[100%] flex items-center overflow-clip py-4 ${
                      ContextFullScreen.toggleFullScreen &&
                      window.innerWidth >= 640
                        ? `hidden`
                        : ``
                    }`}
                  >
                    <div className="max-w-[100%]  flex-col justify-center items-start flex my-2 truncate mr-auto">
                      <MarqueeDiv
                        text={selectedSong?.name || "prop not provided"}
                        textClassName="font-sans font-bold text-xl"
                      />

                      <MarqueeDiv
                        text={selectedSong?.artist?.name || "prop not provided"}
                        textClassName="font-sans font-bold text-[0.9em] opacity-70 hover:underline cursor-pointer"
                        onClick={() => {
                          router.push(`/artists/${selectedSong.artist._id}`);
                        }}
                      />
                    </div>
                    <span className="px-2">
                      <TickOrAdd song={currentSong} />
                    </span>
                  </div>
                  <div className="w-[100%]  sm:hidden">
                    <EndMiddle width="w-[100%]" />
                  </div>
                  <div className="w-[100%]  sm:hidden">
                    {openQueue ? (
                      <HiQueueList
                        className="text-xl cursor-pointer ml-auto"
                        title="Queue"
                        onClick={() => {
                          setOpenQueue(false);
                        }}
                      />
                    ) : (
                      <HiOutlineQueueList
                        className="text-xl cursor-pointer ml-auto"
                        title="Queue"
                        onClick={() => {
                          setOpenQueue(true);
                          ContextShowRight.setShowRight(true);
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div
                className="w-[100%] mt-10  rounded-xl mb-2 relative transition-all duration-500 flex justify-center gap-5 "
                ref={ArtistImageRef}
              >
                <div
                  className={`flex flex-col  relative w-[100%] max-w-[400px]    rounded-xl  bg-zinc-800 mb-1 pb-1 transition-all duration-500  shadow-xl shadow-gray-950`}
                >
                  <div className="font-bold w-[100%] p-3  absolute text-shadow-xl text-shadow-gray-900 flex">
                    About the Artist
                  </div>
                  <div className="song-image w-[100%] transition-all duration-500  max-h-[250px] flex flex-col  bg-zinc-500  rounded-t-xl">
                    <img
                      className="w-[100%] h-[100%] transition-all duration-500 object-cover rounded-t-xl"
                      src={`${
                        selectedSong?.artist?.image || `/images/user.jpg `
                      }`}
                    />
                  </div>
                  <div className="max-w-[100%]">
                    <div className="px-3 pt-2  max-w-[100%] flex justify-between">
                      <p
                        className="max-w-[100%] truncate hover:underline cursor-pointer font-bold"
                        onClick={() => {
                          router.push(`/artists/${selectedSong.artist._id}`);
                        }}
                      >
                        {selectedSong?.artist?.name || "UnKnown Artist"}
                      </p>
                      if it has 5 songs and user click 3 then it will show next 2 song)
                      <Followbutton
                        followObject={{
                          followerId: session.user._id,
                          followerType: session.user.type,
                          targetId: currentSong?.artist?._id,
                          targetType: currentSong?.artist?.type,
                        }}
                        onUpdate={() => {
                          setIsUpdated(true);
                        }}
                      />

                      {/* {console.log(currentSong)} */}
                    </div>
                    {/* <p
                      className="px-3 pt-2 font-bold max-w-[100%] truncate hover:underline cursor-pointer"

                    > <span>

                      {selectedSong?.artist?.followers.artists.length || ""}
                    </span>
                    <Followbutton
                    followObject ={{followerId :session.user._id, followerType : session.user.type, targetId : selectedSong?.artist?._id, targetType : selectedSong?.artist?.type}}
                    onUpdate={() => {
                      setIsUpdated(true);
                    }}
                  />
                    </p> */}

                    <article className="p-3 text-sm   max-h-[calc(16*5)] transition-all duration-300">
                      <ShowMoreShowLess
                        text={selectedSong?.artist?.bio || ""}
                        maxLength={`80`}
                        className="text-white/50"
                      />
                    </article>
                  </div>
                </div>

                {ContextFullScreen.toggleFullScreen && (
                  <div
                    className={`hidden sm:block artist-article max-w-[400px] h-fit rounded-xl  bg-zinc-800 mb-1 pb-1 transition-all duration-500  shadow-xl shadow-gray-950 p-3 `}
                  >
                    <h1 className="text-2xl font-bold px-2">Next in queue</h1>
                    <PlayCard />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </motion.div>
      <QueueAndRecentsSide
        open={openQueue}
        onClose={() => {
          setOpenQueue(false);
        }}
        style={
          ContextFullScreen.toggleFullScreen &&
          typeof window !== "undefined" &&
          window.innerWidth > 640
            ? { width: "400px", position: "relative" }
            : { position: "absolute" }
        }
        className="w-full   h-full top-0 right-0  bottom-0   rounded-lg bg-zinc-900  shadow-xl border border-zinc-700 text-white overflow-y-auto overflow-x-hidden "
      />
    </div>
  );
};

export default React.memo(Right);
