import React, { useState, useEffect, useRef } from "react";
import { GrAdd } from "react-icons/gr";

import { showPlaylistsContext } from "../../Contexts/contexts";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { showRightContext } from "../../Contexts/contexts";
import { createPlaylistForUser } from "@/app/(protected)/actions/playlistActions";
import CreatePlaylistPopup from "../popups/createPlaylistPopup";
import { usePlaylists } from "@/Contexts/playlistsContext";
import { useRouter } from "next/navigation";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import AddButton from "../Helper/AddButton";
const PlayCard = (props) => {
  const pathname = usePathname();
  const router =useRouter()
  const isActive = (route) => pathname === route;
  return (
      <img
        src={`${props.imageUrl}`}
        className={`min-w-[60px] max-w-[60px] min-h-[60px] max-h-[60px] p-1 object-cover rounded-xl ${
          isActive(`/playlists/${props.playlist_id}`)
            ? " bg-zinc-800"
            : " hover:bg-zinc-800"
        }`}
        alt={props.playlist_name}
        title={props.playlist_name}
        onClick={() => {
          if(pathname !== `/playlists/${props.playlist_id}`){
            router.push(`/playlists/${props.playlist_id}`);
          }
        }}
      />
  );
};

const SmallLeft = (props) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const { playlists, fetchPlaylists } = usePlaylists();
  const ContextShowPlaylists = React.useContext(showPlaylistsContext);
  const ContextShowRight = React.useContext(showRightContext);
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
    fetchPlaylists();
  },[]);


  return (
    <div className={`small-left  w-[75px] h-[100%] bg-zinc-900 rounded-xl overflow-hidden`}>
      {playlists && (
        <>
          <div
            className=" flex flex-col  justify-center  items-center  gap-3  w-[100%] h-[100px] p-2 transition-all duration-300  top-0 z-30 "
            ref={leftNavRef}
          >
            <div
              className="toggle-playlists-button-1 cursor-pointer"
              onClick={() => {
                ContextShowPlaylists.setShowPlaylists(true);
                if (window.innerWidth <= 1280) {
                  ContextShowRight.setShowRight(false);
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

            <AddButton tailwindBg={"bg-zinc-800"}/>
          </div>

          <div
            className="relative  max-h-full overflow-y-auto px-1 pb-30 "
            onScroll={handleScroll}
          >
            {playlists?.map((playlist, index) => (
              <div
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  console.log(playlists[index]);
                }}
              >
                <PlayCard
                  key={index}
                  index={index}
                  imageUrl={playlist.image || "/images/notfound.png"}
                  playlist_name={playlist.name}
                  playlist_id={playlist._id}
                ></PlayCard>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(SmallLeft);
