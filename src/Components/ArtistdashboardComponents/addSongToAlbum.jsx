// ===========================
// File: src/components/AddToPlaylistPopup.jsx
// A Spotify‑style "Add to playlist" popup (Enhanced)
// ===========================

"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

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
import Portal from "../Helper/Portal";
export default function AddSongToAlbumPopup({
  album,
  anchorRect,
  open,
  onClose,
  onUpdate
}) {
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [changesMade, setChangesMade] = useState(false);
  const toast = useSpotifyToast();
  const router = useRouter();

   
 
  const fetchSongs = async () => {
    const res = await fetch("/api/artistDashboard/songs");
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    // Only set songs that do not have an album assigned
    const songsWithoutAlbum = data.filter(song => !song.album);
    setSongs(songsWithoutAlbum);
    console.log("Fetched artist (songs without album):");
  };
  useEffect(() => {
    startTransition(async () => {
      await fetchSongs();
    });
  }, []);

  





  const toggleSong = (songId) => {
    setChangesMade(true);
    setSongs((prev) =>
      prev.map((song) =>
        song._id === songId ? { ...song, contains: !song.contains } : song
      )
    );
  };

  // 5. **Applying Changes**: When the user clicks "Done", call the server action to add selected songs to the album.
  const applyChanges = (e) => {
    e.stopPropagation();
    startTransition(async () => {
      const toAdd = songs.filter((s) => !s.original && s.contains).map((s) => s._id);
      if (toAdd.length === 0) {
        onClose();
        return;
      }

      try {
        await fetch("/api/artistDashboard/applySongAlbumChanges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ albumId: album._id, songIds: toAdd }), // Ensure this matches the API
        });
        toast({ text: "Songs added to album!" });
        onUpdate()
        onClose();
      } catch (err) {
        toast({ text: "Failed to add songs to album", type: "error" });
      }
    });
  };


  

  const visibleSongs = songs
    .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    .map((a) => ({ ...a, original: a.original ?? a.contains }));





// -------------------------------------------------------------------------------------------------------------------------------





  return (
    <div
      className="fixed inset-0 z-[9998] bg-transparent"
      onClick={(e) => {
        e.stopPropagation(); // prevent event from reaching things behind
        onClose();
      }}
    >
      <Portal open={open} anchorRect={anchorRect} onClose={onClose}>
        <div
          className=" flex gap-5 mb-2 items-center"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <FaArrowLeft className="text-lg sm:hidden" />
          <h4 className="font-bold ">Add to Album</h4>
        </div>
        <p className="flex items-center justify-between gap-2 bg-white/15 rounded px-2 py-1 mb-2">
          <RiSearchLine className="text-xl" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a playlist"
            className="w-full   outline-none"
          />
        </p>


        <div className="sm:max-h-[100%] pb-50 overflow-y-auto  overflow-x-hidden">
          {visibleSongs?.length === 0 && (
            <NotFound
      
              text={"Single Songs not found"}
              position={"top"}
            />
          )}

          {visibleSongs?.map((song) => (
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
              {" "}
              <div className="flex gap-1 justify-start truncate">
                <img
                  src={`${song?.image}`}
                  className={`min-w-[60px] max-w-[60px] min-h-[60px] max-h-[60px] p-1 object-cover rounded-xl `}
                  alt={song?.name}
                  title={song?.name}
                />
                <div className="w-full flex-col justify-center items-between flex  px-2 truncate">
                  <div className="w-full justify-start text-[14px] font-semibold truncate">
                    {song?.name || "Playlist-Name"}
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
              disabled={isPending}
            >
              {isPending  ? "Saving" : "Done"}
              
            </button>
          )}
        </div>
      </Portal>
    </div>
  )
}
