// ===========================
// File: src/components/AddToPlaylistPopup.jsx
// A Spotify‑style "Add to playlist" popup (Enhanced)
// ===========================

"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLibrary } from "@/Contexts/libraryContext";
import { RiSearchLine, RiSearchEyeFill } from "react-icons/ri";
import { IoAddSharp } from "react-icons/io5";
import { FaRegCircle } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { FaArrowLeft } from "react-icons/fa6";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import NotFound from "../Helper/not-found";
/**********************
 * SERVER‑ACTION IMPORTS
 **********************/
const actionsPromise = import("@/app/(protected)/actions/playlistPopupActions");

export default function AddToPlaylistPopup({
  song,
  anchorRect,
  onClose,
  setOuterRef,
}) {
  const [playlists, setPlaylists] = useState([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [changesMade, setChangesMade] = useState(false);
  const toast = useSpotifyToast();

  const {
    getPlaylistsWithContainKeyForSong,
    fetchLibrary,
  } = useLibrary();
  const popupRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!anchorRect) return;
    const { innerWidth, innerHeight } = window;
    const popupW = 300;
    const popupH = 400;

    let top = anchorRect.bottom + 8;
    let left = anchorRect.left;

    if (left + popupW > innerWidth) left = innerWidth - popupW - 8;
    if (top + popupH > innerHeight) top = anchorRect.top - popupH - 8;
    if (top < 8) top = 8;

    setCoords({ top, left });
  }, [anchorRect]);

  useEffect(() => {
    if (setOuterRef && popupRef.current) {
      setOuterRef(popupRef.current);
    }
  }, [setOuterRef]);

  useEffect(() => {
    setPlaylists(getPlaylistsWithContainKeyForSong(song?._id));
  }, [song._id]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        changesMade == false
      )
        onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const router = useRouter();

  const togglePlaylist = (plId, currentlyIn) => {
    setChangesMade(true);
    setPlaylists((prev) =>
      prev.map((p) => (p._id === plId ? { ...p, contains: !currentlyIn } : p))
    );
  };

  const createNewAndAdd = () => {
    startTransition(async () => {
      const { createPlaylistShell } = await actionsPromise;
      const newPl = await createPlaylistShell(song);
      toast({
        text: `added to ${newPl.name}`,
        image: newPl.image,
      });
      fetchLibrary();
      router.refresh();
      onClose();
    });
  };

  const applyChanges = (e) => {
    e.stopPropagation();
    startTransition(async () => {
      const { applySongPlaylistChanges } = await actionsPromise;
      const affectedIds = playlists
        .filter((p) => p.original !== p.contains)
        .map((p) => ({
          playlistId: p._id,
          add: p.contains,
        }));
      await applySongPlaylistChanges(song._id, affectedIds);
      toast({
        text: `Changes Saved`,
      });
      fetchLibrary();
      router.refresh();
      onClose();
    });
  };

  const visiblePlaylists = playlists
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .map((p) => ({ ...p, original: p.original ?? p.contains }));

  return createPortal(
    <div
    className="fixed inset-0 z-[9998] bg-transparent"
    onClick={(e) => {
      e.stopPropagation(); // prevent event from reaching things behind
      onClose()
    }}
  >
    <motion.div
      ref={popupRef}
      initial={window.innerWidth <= 640 && { y: 300, opacity: 0 }}
      exit={window.innerWidth <= 640 && { y: -200, opacity: 0 }}
      animate={window.innerWidth <= 640 && { y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      // className={`fixed z-[9999] bg-zinc-800 p-1 text-white rounded-md shadow-lg sm:w-[260px]    w-full transition-transform duration-1000    `}
      // drag={window.innerWidth <= 640 ? "y" : false}
      // dragConstraints={{ top: 0, bottom: 300 }}
      // onDragEnd={(event, info) => {
      //   if (window.innerWidth <= 640 && info.offset.y > 100) {
      //     setTimeout(() => {
      //       onClose(); // ✅ call when dragged down enough
      //     }, 1000);
      //   }
      // }}
      style={
        window.innerWidth >= 640
          ? { top: coords.top, left: coords.left }
          : { bottom: "0" }
      }
      className="fixed z-[10000] w-screen  sm:w-[300px] h-screen sm:max-h-[400px]   rounded-lg bg-zinc-900 p-3 shadow-xl border border-zinc-700 text-white overflow-y-auto sm:overflow-hidden"
      onClick={(e) => {
        e.stopPropagation();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        className=" flex gap-5 mb-2 items-center"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <FaArrowLeft className="text-lg sm:hidden" />
        <h4 className="font-bold ">Add to playlist</h4>
      </div>
      <p className="flex items-center justify-between gap-2 bg-zinc-800 rounded px-2 py-1 mb-2">
        <RiSearchLine className="text-xl" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find a playlist"
          className="w-full   outline-none"
        />
      </p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          createNewAndAdd();
        }}
        className="flex items-center font-semibold  text-black/80 sm:text-white/45 gap-2 mx-auto sm:justify-start bg-white sm:bg-transparent w-fit sm:w-full px-2 py-1 sm:hover:bg-zinc-800 rounded-full sm:rounded mb-2"
      >
        <IoAddSharp className="text-xl hidden sm:block" />
        New playlist
      </button>

      <div className="sm:max-h-100 pb-50 overflow-y-auto  overflow-x-hidden">
        {visiblePlaylists.length === 0 && (
          <NotFound
            icon={
              <lord-icon
                src="https://cdn.lordicon.com/wjyqkiew.json"
                trigger="loop"
                delay="1000"
                state="morph-cross"
                colors="primary:#ffffff,secondary:#16c72e"
                style={{ width: 150, height:  150}}
              ></lord-icon>
            }
            text={"No Playlists Found"}

            position={"top"}
          />
        )}

        {visiblePlaylists.map((pl) => (
          <div
            key={pl._id}
            onClick={(e) => {
              e.stopPropagation();
              togglePlaylist(pl._id, pl.contains);
              e.preventDefault();
            }}
            className="flex items-center justify-between gap-2 px-1.5 py-1.5 hover:bg-zinc-800 cursor-pointer rounded "
          >
            {" "}
            <div className="flex gap-1 justify-start truncate">
              <img
                src={`${pl?.image}`}
                className={`min-w-[60px] max-w-[60px] min-h-[60px] max-h-[60px] p-1 object-cover rounded-xl `}
                alt={pl?.name}
                title={pl?.name}
              />
              <div className="w-full flex-col justify-center items-between flex  px-2 truncate">
                <div className="w-full justify-start text-[14px] font-semibold truncate">
                  {pl?.name || "Playlist-Name"}
                </div>
                <p className=" text-xs font-semibold max-w-[100%] truncate justify-start opacity-50">
                  <span>Playlist</span>
                  <span className="px-1">•</span>
                  <span className="total-songs pr-1 ">
                    {pl.songs?.length || 0} songs
                  </span>
                </p>
              </div>
            </div>
            <div>
              {pl.contains ? (
                <TiTick className="text-xl text-black bg-green-500 rounded-full" />
              ) : (
                <FaRegCircle className="text-xl" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center  sm:justify-end bg-transparent sm:bg-zinc-900 p-2 gap-2 sticky sm:absolute bottom-0 right-0 w-full ">
        <button
          className="hidden sm:block text-zinc-400 font-semibold cursor-pointer p-2 hover:bg-white/8 rounded-xl text-sm"
          onClick={onClose}
        >
          Cancel
        </button>
        {(window.innerWidth < 640 || changesMade) && (
          <button
            className="text-black shadow-2xs shadow-black bg-green-500 sm:bg-white  font-semibold cursor-pointer p-2  rounded-2xl text-sm"
            onClick={changesMade ? applyChanges : onClose}
          >
            Done
          </button>
        )}
      </div>
    </motion.div>
    </div>,
    document.body
  );
}
