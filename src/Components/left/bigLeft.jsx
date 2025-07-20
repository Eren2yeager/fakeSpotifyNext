"use client";
import React, { useState, useContext, useEffect, useRef } from "react";
import ListRender from "@/Components/Helper/listRender";
import { GrAdd } from "react-icons/gr";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import {
  playlists,
  showPlaylistsContext,
  isPlayingContext,
  audioRefContext,
} from "@/Contexts/contexts";
import { HiVolumeUp } from "react-icons/hi";
import { FaArrowLeft } from "react-icons/fa6";
import FailedToFetch from "@/Components/Helper/failedToFetch";
import { usePlayer } from "@/Contexts/playerContext";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

// to create playlists
import { createPlaylistForUser } from "@/app/(protected)/actions/playlistActions";
import CreatePlaylistPopup from "../playlistCards/createPlaylistPopup";
import PlaylistContextMenu from "../playlistCards/PlaylistContextMenu";
import EditPlaylistModal from "../playlistCards/updatePlaylistModel";
import { deletePlaylist } from "@/app/(protected)/actions/playlistActions";

const PlayCard = (props) => {
  const Context_isPlaying = useContext(isPlayingContext);
  const ContextPlaylists = useContext(playlists);
  const Context_audio_ref = useContext(audioRefContext);
  const router = useRouter();
  const pathname = usePathname();
  const { play, currentSong, context } = usePlayer();

  let conditionCheck = false;
  if (props.playlist.type === "Song") {
    conditionCheck =
      currentSong?._id === props.playlist._id &&
      props.playlist.type == context.type;
  } else if (props.playlist.type === "Artist") {
    conditionCheck =
      currentSong?.artist?._id === props.playlist._id &&
      props.playlist.type == context.type;
  } else if (props.playlist.type === "Album") {
    conditionCheck =
      currentSong?.album?._id === props.playlist._id &&
      props.playlist.type == context.type;
  } else if (props.playlist.type === "Playlist") {
    conditionCheck =
      props.playlist.songs?.some(
        (songData) => songData.song?._id === currentSong?._id
      ) && props.playlist.type == context.type;
  }
  const handlePlayFromType = async (type, id) => {
    if (currentSong == null || conditionCheck == false) {
      try {
        const res = await fetch(`http://localhost:5000/api/play/${type}/${id}`);
        const data = await res.json();
        play(data.songs, data.current, data.context);
      } catch (err) {
        console.error("Failed to play:", err);
      }
    } else {
      if (conditionCheck && Context_isPlaying.isPlaying) {
        Context_audio_ref.current.pause();
        Context_isPlaying.setisPlaying(false);
      } else {
        Context_audio_ref.current.play();
        Context_isPlaying.setisPlaying(true);
      }
    }
  };

  // for right click context menu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef(null);

  const handleDelete = async () => {
    const ok = await deletePlaylist(props.playlist._id);
    if (ok) {
      if (pathname == `/playlists/${props.playlist._id}`) {
        router.back();
      }
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
    }
  };

  return (
    <>
      <div
        className="playlist-card flex bg-zinc-800 hover:bg-zinc-700 h-[60px] p-1 my-1 rounded-xl cursor-pointer group"
        onClick={() => {
          router.push(`/playlists/${props.playlist._id}`);
        }}
        ref={cardRef}
      >
        <div className="relative max-w-[50px] min-w-[50px] h-[50x] bg-zinc-900 rounded-xl">
          <img
            src={props.imageUrl || "/images/notfound.png"}
            className=" w-full h-full object-cover rounded-xl group-hover:opacity-40"
            alt=""
          />
          <span
            className="absolute bottom-1/4 left-1/4  hidden group-hover:block active:transform-[scale(0.9)]"
            onClick={(e) => {
              e.stopPropagation();
              handlePlayFromType(props.playlist.type, props.playlist._id);
            }}
          >
            {conditionCheck && Context_isPlaying.isPlaying ? (
              <IoIosPause className="text-2xl  cursor-pointer" />
            ) : (
              <IoIosPlay className="text-2xl  cursor-pointer" />
            )}
          </span>
        </div>
        <div className="w-full flex-col justify-center items-start flex  px-2 truncate">
          <div
            className={`w-full justify-start text-[14px] font-semibold truncate ${
              conditionCheck && "text-green-500"
            }`}
          >
            {props.playlistName || "Playlist-Name"}
          </div>
          <p className=" text-xs font-semibold max-w-[100%] truncate justify-start opacity-50">
            <span>Playlist</span>
            <span className="px-1">•</span>
            <span className="total-songs pr-1 ">
              {props.playlist.songs.length || 0} songs
            </span>
          </p>
        </div>
        {conditionCheck && Context_isPlaying.isPlaying && (
          <div className="ml-auto mr-5 group-hover/PlaylistCard:hidden my-auto">
            <HiVolumeUp className="text-xl text-green-500" />
          </div>
        )}
      </div>
      {props.playlist.type !== "Liked" && (
        <div>
          <PlaylistContextMenu
            triggerRef={cardRef}
            onEdit={() => setIsModalOpen(true)}
            onDelete={handleDelete}
          />
        </div>
      )}

      {isModalOpen && props.playlist.type !== "Liked" && (
        <EditPlaylistModal
          playlist={props.playlist}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

const BigLeft = (props) => {
  const [activeItem, setActiveItem] = useState(0);
  const ContextPlaylists = useContext(playlists);
  const ContextShowPlaylists = useContext(showPlaylistsContext);
  const router = useRouter();

  // for scrolling effect
  const leftNavRef = React.useRef(null);

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
    <div
      className={`left max-w-[100%] h-[100%]  rounded-xl bg-zinc-900   py-1 overflow-hidden  text-white  group/bigLeft`}
    >
      {ContextPlaylists.allPlaylists ? (
        <>
          <div className="flex flex-row justify-between items-center px-3 my-3 gap-3 ">
            <div className="flex gap-2 justify-center items-center transform sm:translate-x-[-30px] group-hover/bigLeft:translate-x-[0px] transition-all duration-150">
              <div
                className="toggle-playlists-button-2 hidden sm:block cursor-pointer transform sm:translate-x-[-30px] sm:group-hover/bigLeft:translate-x-[0px] transition-all duration-100"
                onClick={() => {
                  ContextShowPlaylists.setShowPlaylists(false);
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
              <div
                className="sm:hidden"
                onClick={() => {
                  router.back();
                }}
              >
                <FaArrowLeft className="text-lg" />
              </div>
              <div className="font-bold text-xl">Your Library</div>
            </div>
            <div
              title="Create new Playlist"
              className={` w-auto flex justify-center items-center ml-1 p-2 rounded-full hover:bg-zinc-700 transition-all duration-500 bg-zinc-800 cursor-pointer`}
              onClick={() => setShowPopup(!showPopup)}
              onBlur={() => {
                setShowPopup(false);
              }}
              ref={createRef}
            >
              <GrAdd
                className={`text-xl transform transition-transform duration-300 ${
                  showPopup ? " rotate-45" : "rotate-0"
                }`}
              />
              {props.leftWidth > 285 && (
                <p className="font-bold pl-1 hidden sm:block">Create</p>
              )}

              {showPopup && (
                <CreatePlaylistPopup
                  className={
                    "absolute z-100 bottom-0 left-0 w-full sm:top-[60px] sm:bottom-auto sm:left-50 sm:w-[300px] bg-zinc-700  text-white p-2 rounded-lg shadow-lg"
                  }
                  onCreate={handleCreate}
                  onClose={() => setShowPopup(false)}
                  trigger={createRef}
                />
              )}
            </div>
          </div>

          <div
            className="relative flex justify-start gap-2 px-3 pb-2 max-h-[50px] transition-all duration-500"
            ref={leftNavRef}
          >
            <ListRender
              activeItem={{ activeItem, setActiveItem }}
              listItems={["Playlists", "Albums", "Artists"]}
              className="flex gap-2"
            />
          </div>

          <div
            className="playlist-container w-auto h-screen px-3 overflow-y-auto pb-65"
            onScroll={handleScroll}
          >
            {ContextPlaylists.allPlaylists.length > 0 ? (
              ContextPlaylists.allPlaylists?.map((playlist, index) => (
                <div
                  key={index}
                  onClick={() => {
                    console.log(playlist);
                  }}
                >
                  <PlayCard
                    index={index}
                    imageUrl={playlist.image || "/images/notfound.png"}
                    playlistName={playlist.name || "Playlist Name"}
                    playlist={playlist}
                  ></PlayCard>
                </div>
              ))
            ) : (
              <div className="font-bold text-center pt-20">
                No Playlists Found
              </div>
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
export default BigLeft;
