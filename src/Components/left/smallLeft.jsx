import React, { useState, useEffect, useRef, useTransition } from "react";
import { GrAdd } from "react-icons/gr";

import { usePathname } from "next/navigation";

import { useOtherContexts } from "@/Contexts/otherContexts";
import { useLibrary } from "@/Contexts/libraryContext";
import { useRouter } from "next/navigation";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import AddButton from "../Helper/AddButton";
const PlayCard = (props) => {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (route) => pathname === route;

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
    <img
      src={`${props.item.image}`}
      className={`min-w-[60px] max-w-[60px] min-h-[60px] max-h-[60px] p-1 object-cover  ${
        isActive(`/playlists/${props.item._id}`)
          ? " bg-zinc-800"
          : " hover:bg-zinc-800"
      }  ${props.item.type === "Artist" ? "rounded-full" : "rounded-md"}`}
      alt={props.item.name}
      title={props.item.name}
      onClick={handleItemClick}
    />
  );
};

const SmallLeft = (props) => {
  const [items, setItems] = useState(null);
  const { library, fetchLibrary } = useLibrary();
  const [isPending, startTransition] = useTransition();

  const {
    toggleFullScreen,
    setToggleFullScreen,
    showRight,
    setShowRight,
    showLibrary,
    setShowLibrary,
  } = useOtherContexts();

  // for scrolling effect
  const toast = useSpotifyToast();

  const leftNavRef = React.useRef(null);
  const handleScroll = (e) => {
    const target = e.target;
    if (target.scrollTop > 0) {
      leftNavRef.current.classList.add("shadow-xs", "shadow-zinc-950");
      leftNavRef.current.classList.remove("bg-transparent");
    } else {
      leftNavRef.current.classList.remove("shadow-xs", "shadow-zinc-950");
      leftNavRef.current.classList.add("bg-transparent");
    }
  };

  useEffect(() => {
    startTransition(async () => {
      await fetchLibrary();
      if (!items) {
        setItems(library?.all);
      } else if (props.activeItem === 1) {
        setItems(library?.playlists);
      } else if (props.activeItem === 2) {
        setItems(library?.artists);
      } else if (props.activeItem === 3) {
        setItems(library?.albums);
      }
    });
  }, []);

  useEffect(() => {
    if (props.activeItem === 0) {
      setItems(library?.all);
    } else if (props.activeItem === 1) {
      setItems(library?.playlists);
    } else if (props.activeItem === 2) {
      setItems(library?.albums);
    } else if (props.activeItem === 3) {
      setItems(library?.artists);
    }
  }, [library, props.activeItem]);

  return (
    <div
      className={`small-left  w-[75px] h-[100%] bg-zinc-900 rounded-xl overflow-hidden  `}
    >
      {library && (
        <>
          <div
            className=" flex flex-col  justify-center  items-center  gap-3  w-[100%] h-[100px] p-2 transition-all duration-300  top-0 z-30 "
            ref={leftNavRef}
          >
            <div
              className="toggle-playlists-button-1 cursor-pointer"
              onClick={() => {
                setShowLibrary(true);
                if (window.innerWidth <= 1280) {
                  setShowRight(false);
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="30px"
                viewBox="0 -960 960 960"
                width="30px"
                fill="#e3e3e3"
              >
                <path d="M500-640v320l160-160-160-160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm120-80v-560H200v560h120Zm80 0h360v-560H400v560Zm-80 0H200h120Z" />
              </svg>
            </div>

            <AddButton tailwindBg={"bg-zinc-800"} />
          </div>

          <div
            className="relative  max-h-full overflow-y-auto px-1 pb-30 "
            onScroll={handleScroll}
          >
            {items?.map((item, index) => (
              <div
                key={index}

              >
                <PlayCard key={index} index={index} item={item}></PlayCard>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(SmallLeft);
