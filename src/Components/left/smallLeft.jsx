import React, { useState, useEffect, useRef } from "react";
import { GrAdd } from "react-icons/gr";

import { playlists, showPlaylistsContext } from "../../Contexts/contexts";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { showRightContext } from "../../Contexts/contexts";
import { createPlaylistForUser } from "@/app/(protected)/actions/playlistActions";
import CreatePlaylistPopup from "../playlistCards/createPlaylistPopup";

const PlayCard = (props) => {
  const pathname = usePathname();
  const isActive = (route) => pathname === route;
  return (
    <Link
      href={`/playlists/${props.playlist_id}`}

    >
        <img
          src={`${props.imageUrl}`}
          className={`min-w-[60px] max-w-[60px] min-h-[60px] max-h-[60px] p-1 object-cover rounded-xl ${
            isActive(`/playlists/${props.playlist_id}`)
              ? " bg-zinc-800"
              : " hover:bg-zinc-800"
          }`}
          alt={props.playlist_name}
          title={props.playlist_name}
        />
    </Link>
  );
};

const SmallLeft = (props) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const ContextPlaylists = React.useContext(playlists);
  const ContextShowPlaylists = React.useContext(showPlaylistsContext);
  const ContextShowRight = React.useContext(showRightContext);
  // for scrolling effect

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

  const [showPopup, setShowPopup] = useState(false);
  const [isUpdated, setisUpdated] = useState(false);

  const handleCreate = async () => {
    const ok = await createPlaylistForUser();
    if (ok) {
      setisUpdated(true);
    }
  };

  useEffect(() => {
    setisUpdated(false);
    fetch("/api/playlists")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch playlists");
        }
        return res.json();
      })
      .then((data) => {
        ContextPlaylists.setAllPlaylists(data);
      })
      .catch((err) => {
        console.error("❌ Error fetching playlists:", err);
      });
  }, [isUpdated]);

  const createRef = useRef(null);

  return (
    <div className={`small-left  w-[75px] h-[100%] bg-zinc-900 rounded-xl `}>
      {ContextPlaylists && (
        <>
          <div
            className=" flex flex-col  justify-center  items-center  gap-3  w-[100%] h-[100px] p-2 transition-all duration-300 sticky top-0 z-30 "
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

            <div
              title="Create new Playlist"
              className="w-8 h-8 flex justify-center items-center  px-2 py-2  rounded-full bg-zinc-800"
              onClick={() => setShowPopup(!showPopup)}
              onBlur={() => {
                setShowPopup(false);
              }}
              ref={createRef}
            >
              <GrAdd
                className={`transform transition-transform duration-300 ${
                  showPopup ? " rotate-45" : "rotate-0"
                }`}
                size={15}
              />
              {showPopup && (
                <CreatePlaylistPopup
                  className={
                    "absolute z-100 top-[100px] left-[10px] w-[300px] bg-zinc-700  text-white p-2 rounded-lg shadow-lg"
                  }
                  onCreate={handleCreate}
                  onClose={() => setShowPopup(false)}
                  trigger={createRef}
                />
              )}
            </div>
          </div>

          <div
            className="relative  max-h-full overflow-y-auto m-1 pb-30 "
            onScroll={handleScroll}
          >
            {ContextPlaylists.allPlaylists?.map((playlist, index) => (
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

export default SmallLeft;
