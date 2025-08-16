"use client";
import React, { useState, useContext, useEffect, useRef } from "react";
import { useTransition } from "react";
import ListRender from "@/Components/Helper/listRender";
import { GrAdd } from "react-icons/gr";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";

import { useOtherContexts } from "@/Contexts/otherContexts";
import { HiVolumeUp } from "react-icons/hi";
import { FaArrowLeft } from "react-icons/fa6";
import FailedToFetch from "@/Components/Helper/failedToFetch";
import { usePlayer } from "@/Contexts/playerContext";
import { useLibrary } from "@/Contexts/libraryContext";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import NotFound from "../Helper/not-found";
import { RiSearchLine } from "react-icons/ri";
// to create playlists

import PlaylistContextMenu from "../playlistCards/PlaylistContextMenu";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import AddButton from "../Helper/AddButton";
import { CurrentUserProfileCircle } from "../Helper/profileCircle";
import ThreeDotsLoader from "../Helper/ThreeDotsLoader";
import { useSession } from "next-auth/react";
const PlayCard = (props) => {
  const router = useRouter();
  const pathname = usePathname();
  const {data : session} = useSession();
  const {  handlePlayFromType, conditionCheckForSong  , isPlaying } = usePlayer();

  const toast = useSpotifyToast();

  const conditionCheck = conditionCheckForSong(props.item);

  // for right click context menu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const cardRef = useRef(null);

  const handleItemClick = () => {
    if (props.item.type == "Playlist") {
      if (pathname !== `/playlists/${props.item._id}`) {
        router.push(`/playlists/${props.item._id}`);
      }
    } else if (props.item.type == "Artist") {
      if (pathname !== `/artists/${props.item._id}`) {
        router.push(`/artists/${props.item._id}`);
      }
    } else if (props.item.type == "Album") {
      if (pathname !== `/albums/${props.item._id}`) {
        router.push(`/albums/${props.item._id}`);
      }
    }
  };

  return (
    <>
      <div
        className="playlist-card flex  hover:bg-zinc-800 h-[60px] p-1 my-1 rounded-md cursor-pointer group transform active:scale-[98%]"
        onClick={handleItemClick}
        onContextMenu={(e) => {
          e.preventDefault();
          setAnchor(e.currentTarget.getBoundingClientRect());
          setIsModalOpen(true);
        }}
        // onPointerDown={(e) => {
        //   if (e.pointerType === "touch") {
        //     // Long press detection for touch devices
        //     e.persist?.();
        //     let timer = setTimeout(() => {
        //       setAnchor(e.currentTarget.getBoundingClientRect())
        //       setIsModalOpen(true);
        //     }, 500);
        //     const cancel = () => {
        //       clearTimeout(timer);
        //       window.removeEventListener("pointerup", cancel);
        //       window.removeEventListener("pointermove", cancel);
        //       window.removeEventListener("pointercancel", cancel);
        //     };
        //     window.addEventListener("pointerup", cancel, { once: true });
        //     window.addEventListener("pointermove", cancel, { once: true });
        //     window.addEventListener("pointercancel", cancel, { once: true });
        //   }
        // }}
        ref={cardRef}
      >
        <div
          className={`relative max-w-[50px] min-w-[50px] max-h-[50x] min-h-[50px] bg-zinc-900  ${
            props.item.type === "Artist" ? "rounded-full" : "rounded-md"
          }`}
        >
          <img
            src={props.item?.image || "/images/notfound.png"}
            className={` w-full h-full object-cover  group-hover:opacity-40  ${
              props.item.type === "Artist" ? "rounded-full" : "rounded-md"
            }`}
            alt=""
          />
          <span
            className="absolute bottom-1/4 left-1/4  hidden group-hover:block active:transform-[scale(0.9)]"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handlePlayFromType(props.item);
            }}
          >
            {props.item.songs.length > 0 &&
              (conditionCheck && isPlaying ? (
                <IoIosPause className="text-2xl  cursor-pointer" />
              ) : (
                <IoIosPlay className="text-2xl  cursor-pointer" />
              ))}
          </span>
        </div>
        <div className="w-full flex-col justify-center items-start flex  px-2 truncate">
          <div
            className={`w-full justify-start text-[14px] font-semibold truncate ${
              conditionCheck && "text-green-500"
            }`}
          >
            {props.item?.name || "Playlist-Name"}
          </div>
          <p className=" text-xs font-semibold max-w-[100%] truncate justify-start opacity-50">
            <span>{props.item.type}</span>

            {props.item.type !== "Artist" && (
              <>
                 {props.item.specialtype !== "Liked" && 
<>
                <span className="px-1">•</span>
                <span className="total-songs  ">
                  {props.item.type == "Playlist" 
                    ? `${props.item.createdBy?.name || "Unknown User"}`
                    : props.item.type == "Album"
                    ? `${props.item.artist?.name || "Unknown Artist"}`
                    : ""}
                </span>
                </>
}
                {props.item.specialtype === "Liked" &&
                <>
                    {props.item?.songs?.length
                      ? props.item.songs.length == 1
                        ? ` • ${props.item.songs.length} song`
                        : ` • ${props.item.songs.length} songs`
                      : ""}
                </>
                }
              </>
            )}
          </p>
        </div>
        {conditionCheck && isPlaying && (
          <div className="ml-auto mr-5 group-hover/PlaylistCard:hidden my-auto">
            <HiVolumeUp className="text-xl text-green-500" />
          </div>
        )}
      </div>
      {/* 
        The logic here is confusing and likely incorrect. Let's break it down:

        {(!props.item.specialtype  && props.item.createdBy ? props.item.createdBy._id == session?.user._id  : true) && ( ... )}

        - If props.item.specialtype is falsy and props.item.createdBy is truthy, then check if createdBy._id == session?.user._id.
        - If not, just return true (so always show for specialtype truthy or createdBy falsy).

        This means:
        - For "special" playlists (e.g. Liked Songs, where specialtype is truthy), the menu is always shown (which is probably not what you want).
        - For normal playlists, if createdBy is missing, the menu is always shown (which is probably not what you want).
        - For normal playlists with createdBy, only show if the user is the creator.

        A clearer, more correct logic is:
        - If the playlist is a "special" playlist (specialtype is truthy), do NOT show the menu.
        - Otherwise, only show the menu if the current user is the creator.

        So:
        */}
      {(!props.item.specialtype && props.item.createdBy && props.item.createdBy._id == session?.user._id) && (
        <div>
          <PlaylistContextMenu
            playlist={props.item}
            open={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
            }}
            anchorRect={anchor}
          />
        </div>
      )}
    </>
  );
};

const BigLeft = (props) => {
  const [items, setItems] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const { library, fetchLibrary } = useLibrary();

  const  { 
setShowLibrary} = useOtherContexts()
  const router = useRouter();

  // for scrolling effect
  const leftNavRef = React.useRef(null);
  const toast = useSpotifyToast();

  const handleScroll = (e) => {
    const target = e.target;
    if (target.scrollTop > 0) {
      leftNavRef.current.classList.add("shadow-xs", "shadow-gray-950");
      leftNavRef.current.classList.remove("bg-transparent");
    } else {
      leftNavRef.current.classList.remove("shadow-xs", "shadow-gray-950");
      leftNavRef.current.classList.add("bg-transparent");
    }
  };

  useEffect(() => {
    startTransition(() => {
      if (!library) {
        fetchLibrary();
      }
    });
  }, [library]);

  useEffect(() => {
    if (props.activeItem == 0) {
      setItems(library?.all);
    } else if (props.activeItem == 1) {
      setItems(library?.playlists);
    } else if (props.activeItem == 2) {
      setItems(library?.albums);
    } else if (props.activeItem == 3) {
      setItems(library?.artists);
    }
  }, [library, props.activeItem]);
  // const createRef = useRef(null);

  const visibleItems = items?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleNavChange = () => {};

  return (
    <div
      className={`left max-w-[100%] h-[100%]  rounded-xl bg-zinc-900   py-1 overflow-hidden  text-white  group/bigLeft`}
    >
      {isPending ? (
        <div className="w-full h-full flex justify-center items-center">
          <ThreeDotsLoader />
        </div>
      ) : library ? (
        <>
          <div className="flex flex-row justify-between items-center px-3 my-3 gap-3 ">
            <div className="flex gap-2 justify-center items-center transform lg:translate-x-[-30px] group-hover/bigLeft:translate-x-[0px] transition-all duration-150">
              <div
                className="toggle-playlists-button-2 hidden sm:block cursor-pointer transform lg:translate-x-[-30px] lg:group-hover/bigLeft:translate-x-[0px] transition-all duration-100"
                onClick={() => {
                  
setShowLibrary(false);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="30px"
                  viewBox="0 -960 960 960"
                  width="30px"
                  fill="#e3e3e3"
                >
                  <path d="M460-320v-320L300-480l160 160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm440-80h120v-560H640v560Zm-80 0v-560H200v560h360Zm80 0h120-120Z" />
                </svg>
              </div>
              <div className="sm:hidden">
                <CurrentUserProfileCircle />
              </div>
              <div className="font-bold text-xl">Your Library</div>
            </div>
            <AddButton
              wantText={props.leftWidth > 285}
              tailwindBg={"bg-zinc-800"}
            />
          </div>

          <div
            className="relative flex justify-start gap-2 px-3 pb-2 max-h-[50px] transition-all duration-500 overflow-x-auto max-w-[100%]"
            ref={leftNavRef}
          >
            <ListRender
              activeItem={props.activeItem}
              setActiveItem={props.setActiveItem}
              listItems={["All", "Playlists", "Albums", "Artists"]}
              className="flex gap-2"
            />
          </div>
          <p className="flex items-center justify-between gap-2 bg-zinc-800 rounded-md py-1 mb-1  mx-3 px-3">
            <RiSearchLine className="text-xl" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in Library"
              className="w-full   outline-none"
            />
          </p>

          <div
            className="playlist-container w-auto h-screen px-3 overflow-y-auto pb-100"
            onScroll={handleScroll}
          >
            {visibleItems?.length > 0 ? (
              visibleItems?.map((item, index) => (
                <div key={index}>
                  <PlayCard index={index} x item={item}></PlayCard>
                </div>
              ))
            ) : (
              <NotFound
                icon={
                  <lord-icon
                    src="https://cdn.lordicon.com/wjyqkiew.json"
                    trigger="loop"
                    delay="1000"
                    state="morph-cross"
                    colors="primary:#ffffff,secondary:#16c72e"
                    style={{ width: 150, height: 150 }}
                  ></lord-icon>
                }
                text={"No Playlists Found"}
                position={"center"}
              />
            )}
          </div>
        </>
      ) : (
        <div className="flex w-[100%] h-[100%] justify-center items-center">
          <FailedToFetch />
        </div>
      )}
    </div>
  );
};
export default React.memo(BigLeft);
