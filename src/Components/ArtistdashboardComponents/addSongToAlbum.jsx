// ===========================
// File: src/components/AddToPlaylistPopup.jsx
// A Spotify‑style "Add to playlist" popup (Enhanced)
// ===========================

"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Only import these on client, safe for Next.js
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { RiSearchLine } from "react-icons/ri";
import { FaRegCircle } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { FaArrowLeft } from "react-icons/fa6";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import NotFound from "../Helper/not-found";
import ThreeDotsLoader from "../Helper/ThreeDotsLoader";

/**
 * AddSongToAlbumPopup
 *
 * This component is safe for Next.js build and deployment.
 * - No server-only code or Node.js APIs are imported or used.
 * - All logic is client-side and browser-compatible.
 */
export default function AddSongToAlbumPopup({
  album,
  anchorRect,
  open,
  onClose,
  onUpdate
}) {
  const [songs, setSongs] = useState(null);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);
  const [changesMade, setChangesMade] = useState(false);
  const toast = useSpotifyToast();
  const router = useRouter();

  const popupRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // Only run this effect on client
  useEffect(() => {
    if (!anchorRect) return;
    if (typeof window === "undefined") return;
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
  }, [onClose, changesMade]);

  // Fetch songs from API (client-side only)
  const fetchSongs = async () => {
    try {
      setIsFetching(true);
      const res = await fetch("/api/artistDashboard/songs");
      if (!res.ok) {
        setSongs([]);
        return;
      }
      const data = await res.json();
      const songsWithoutAlbum = data.filter((song) => !song.album);
      setSongs(songsWithoutAlbum);
    } finally {
      setIsFetching(false);
    }
  };
  useEffect(() => {
    fetchSongs();
    // eslint-disable-next-line
  }, []);

  const toggleSong = (songId) => {
    setChangesMade(true);
    setSongs((prev) =>
      prev.map((song) =>
        song._id === songId ? { ...song, contains: !song.contains } : song
      )
    );
  };

  // When the user clicks "Done", call the server action to add selected songs to the album.
  const applyChanges = (e) => {
    e.stopPropagation();
    startTransition(async () => {
      const toAdd = songs
        .filter((s) => !s.original && s.contains)
        .map((s) => s._id);
      if (toAdd.length === 0) {
        onClose();
        return;
      }

      try {
        await fetch("/api/artistDashboard/applySongAlbumChanges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ albumId: album._id, songIds: toAdd }),
        });
        toast({ text: "Songs added to album!" });
        onUpdate();
        onClose();
      } catch (err) {
        toast({ text: "Failed to add songs to album", type: "error" });
      }
    });
  };

  const visibleSongs = Array.isArray(songs)
    ? songs
        .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
        .map((a) => ({ ...a, original: a.original ?? a.contains }))
    : [];

  // Only render portal on client
  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9998] bg-transparent"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <motion.div
        ref={popupRef}
        initial={typeof window !== "undefined" && window.innerWidth <= 640 ? { y: 300, opacity: 0 } : false}
        exit={typeof window !== "undefined" && window.innerWidth <= 640 ? { y: -200, opacity: 0 } : false}
        animate={typeof window !== "undefined" && window.innerWidth <= 640 ? { y: 0, opacity: 1 } : false}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={
          typeof window !== "undefined" && window.innerWidth >= 640
            ? { top: coords.top, left: coords.left }
            : { bottom: "0" }
        }
        className="fixed z-[10000] w-screen sm:w-[300px] h-screen sm:max-h-[400px] rounded-lg bg-zinc-900 p-3 shadow-xl border border-zinc-700 text-white overflow-y-auto sm:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex gap-5 mb-2 items-center"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <FaArrowLeft className="text-lg sm:hidden" />
          <h4 className="font-bold ">Add to Album</h4>
        </div>
        <p className="flex items-center justify-between gap-2 bg-zinc-800 rounded px-2 py-1 mb-2">
          <RiSearchLine className="text-xl" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a song"
            className="w-full   outline-none"
          />
        </p>

        <div className="sm:max-h-100 pb-50 overflow-y-auto  overflow-x-hidden">
          {isFetching || songs === null ? (
            <div className="w-full h-[120px] flex items-center justify-center">
              <ThreeDotsLoader />
            </div>
          ) : visibleSongs.length === 0 ? (
            <NotFound
              text={songs.length === 0 ? "You have no single songs yet" : "No matching songs"}
              position={"top"}
              buttonText={songs.length === 0 ? "Upload Song" : undefined}
              buttonOnClick={
                songs.length === 0
                  ? () => {
                      onClose?.();
                      router.push("/artistDashboard/songs");
                    }
                  : undefined
              }
            />
          ) : (
            visibleSongs.map((song) => (
              <div
                key={song._id}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSong(song._id, song.contains);
                  e.preventDefault();
                }}
                disabled={isPending}
                className="flex items-center justify-between gap-2 px-1.5 py-1.5 hover:bg-zinc-800 cursor-pointer rounded "
              >
                <div className="flex gap-1 justify-start truncate">
                  <img
                    src={`${song?.image}`}
                    className={`min-w-[60px] max-w-[60px] min-h-[60px] max-h-[60px] p-1 object-cover rounded-xl `}
                    alt={song?.name}
                    title={song?.name}
                  />
                  <div className="w-full flex-col justify-center items-between flex  px-2 truncate">
                    <div className="w-full justify-start text-[14px] font-semibold truncate">
                      {song?.name || "Song"}
                    </div>
                  </div>
                </div>
                <div>
                  {song.contains ? (
                    <TiTick className="text-xl text-black bg-green-500 rounded-full" />
                  ) : (
                    <FaRegCircle className="text-xl" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center  sm:justify-end bg-transparent sm:bg-zinc-900 p-2 gap-2 sticky sm:absolute bottom-0 right-0 w-full ">
          <button
            className="hidden sm:block text-zinc-400 font-semibold cursor-pointer p-2 hover:bg-white/8 rounded-xl text-sm"
            onClick={onClose}
          >
            Cancel
          </button>
          {(typeof window !== "undefined" && window.innerWidth < 640) || changesMade ? (
            <button
              className="text-black shadow-2xs shadow-black bg-green-500 sm:bg-white  font-semibold cursor-pointer p-2  rounded-2xl text-sm"
              onClick={changesMade ? applyChanges : onClose}
              disabled={isPending}
            >
              {isPending ? "Saving" : "Done"}
            </button>
          ) : null}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
