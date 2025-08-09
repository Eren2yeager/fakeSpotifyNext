// ===========================
// File: src/components/ThreeDotsPopUp.jsx  (re‑written)
// Spotify‑style three‑dots context menu
// ===========================

"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { isSongInAnyPlaylist } from "@/app/(protected)/actions/playlistChecks";
import {
  removeSongFromPlaylist,
  toggleLikeSong,
} from "@/app/(protected)/actions/songActions";
import { useLibrary } from "@/Contexts/libraryContext";
import { TiTick } from "react-icons/ti";
import { IoIosAddCircleOutline } from "react-icons/io";
import { BiAddToQueue } from "react-icons/bi";
import { IoAddSharp } from "react-icons/io5";
import { IoMdArrowDropright } from "react-icons/io";
import { RiDeleteBin7Line } from "react-icons/ri";
import { BiAlbum } from "react-icons/bi";
import { MdOutlinePersonOutline } from "react-icons/md";
import AddToPlaylistPopup from "./AddToPlaylistPopup";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
/*************************
 * Helper item component  *
 *************************/

const MenuItem = ({ startIcon, endIcon, label, onClick }) => (
  <div
    onClick={onClick}
    className=" text-sm w-full px-2 py-2 text-left hover:bg-zinc-600 flex items-center gap-2 rounded-md cursor-pointer select-none"
  >
    <span className="w-5">{startIcon}</span>
    <span className="w-full truncate">{label}</span>
    {endIcon && <span className="w-5">{endIcon}</span>}
  </div>
);

/*************************
 * Main popup component   *
 *************************/
export default function ThreeDotsPopUp({
  song,
  playlistId,
  playlistCreaterId,
  anchorRect,
  onClose,
}) {
  const [liked, setLiked] = useState(false);
  const {data :session}  = useSession()
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useSpotifyToast();
  const { checkSongIsInLikedSongs, fetchLibrary } =
    useLibrary();

  const [childRef, setChildRef] = useState(null); // <-- track nested popup DOM
  /* dynamic coords */
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!anchorRect) return;
    const { innerWidth, innerHeight } = window;
    const w = 260,
      h = 210;
    let top = anchorRect.bottom + 6;
    let left = anchorRect.left;
    if (left + w > innerWidth) left = innerWidth - w - 8;
    if (top + h > innerHeight) top = anchorRect.top - h - 6;
    if (top < 8) top = 8;
    setCoords({ top, left });
  }, [anchorRect]);

  /* click‑outside */
  const selfRef = useRef(null);
  useEffect(() => {
    const handle = (e) => {
      const insideSelf = selfRef.current && selfRef.current.contains(e.target);
      const insideChild = childRef && childRef.contains(e.target);
      if (!insideSelf && !insideChild) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [childRef, onClose]);
  /* liked check */
  const refreshLiked = () =>
    startTransition(async () => {
      const includes = checkSongIsInLikedSongs(song._id);
      if (includes) {
        setLiked(true);
      } else {
        setLiked(false);
      }
    });

  useEffect(refreshLiked, [song._id]);

  /* handlers */
  const handleRemoveSong = (e) => {
    e.stopPropagation();
    if (!playlistId) return;
    startTransition(async () => {
      await removeSongFromPlaylist(song._id, playlistId);
      toast({
        text: `Removed from this playlist`,
      });
      fetchLibrary();
      onClose();
    });
  };

  const handleToggleLike = (e) => {
    e.stopPropagation();
    startTransition(async () => {
      await toggleLikeSong(song._id);
      toast({
        text: `Changes Saved`,
      });
      refreshLiked();
      fetchLibrary();
      onClose();
    });
  };

  // for background inactivity

  const [showPopup, setShowPopup] = useState(false);
  const [anchor1, setAnchor1] = useState(false);
  /* portal render */
  return createPortal(
    <div
      className="fixed  inset-0 z-[9998] bg-black/45 sm:bg-transparent"
      onClick={(e) => {
        e.stopPropagation(); // prevent event from reaching things behind
        onClose();
      }}
    >
      <motion.div
        ref={selfRef}
        initial={window.innerWidth <= 640 && { y: "100%", opacity: 0 }}
        exit={window.innerWidth <= 640 && { y: "-100%", opacity: 0 }}
        animate={window.innerWidth <= 640 && { y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`fixed z-[9999] bg-zinc-800 p-1 text-white rounded-md shadow-lg sm:w-[260px]    w-full transition-transform duration-1000    `}
        drag={window.innerWidth <= 640 ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={(event, info) => {
          if (window.innerWidth <= 640 && info.offset.y > 100) {
            setTimeout(() => {
              onClose(); // ✅ call when dragged down enough
            }, 1000);
          }
        }}
        style={
          window.innerWidth >= 640
            ? { top: coords.top, left: coords.left }
            : { bottom: "0" }
        }
        onClick={(e) => {
          e.stopPropagation();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
        }}
      >
        {" "}
        <div className="h-1.5 w-[40%] sm:hidden mx-auto my-1 rounded-xs flex bg-white/45 " />
        <div className="flex gap-1 justify-start ">
          <img
            src={`${song?.image}`}
            className={`min-w-[60px] max-w-[60px] min-h-[60px] max-h-[60px] p-1 object-cover rounded-xl `}
            alt={song?.name}
            title={song?.name}
          />
          <div className="flex flex-col mt-2 h-[30%] w-[100%] justify-start text-xs sm:text-[1em] ">
            <div
              className="song-name text-wrap   overflow-hidden text-ellipsis break-words "
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}
            >
              {song?.name}
            </div>
            <div className="song-artist  lg:text-wrap max-w-[95%]  lg:max-h-[3em] overflow-hidden truncate opacity-70 text-[0.7em]">
              {song?.artist?.name}
            </div>
          </div>
        </div>
        {/* // for add to playlist */}
        <MenuItem
          startIcon={<IoAddSharp className="cursor-pointer" size={20} />}
          endIcon={<IoMdArrowDropright className="cursor-pointer" size={20} />}
          label="Add to playlist"
          onClick={(e) => {
            e.stopPropagation();
            setAnchor1(e.currentTarget.getBoundingClientRect());
            setShowPopup(true);
            // e.preventDefault()
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        />
        {/* nested Add‑to‑playlist popup */}
        {showPopup && (
          <AddToPlaylistPopup
            song={song}
            anchorRect={anchorRect}
            onClose={onClose}
            setOuterRef={setChildRef} /* pass ref up */
          />
        )}
        {(playlistId && playlistCreaterId == session.user._id) && (
          <MenuItem
            startIcon={
              <RiDeleteBin7Line className="cursor-pointer" size={20} />
            }
            label="Remove from this playlist"
            onClick={handleRemoveSong}
          />
        )}
        {liked ? (
          <MenuItem
            startIcon={
              <TiTick
                className="text-black bg-green-600 rounded-full  animate-pulse cursor-pointer"
                size={20}
              />
            }
            label="Remove from your Liked Songs"
            onClick={handleToggleLike}
          />
        ) : (
          <MenuItem
            startIcon={
              <IoIosAddCircleOutline className="cursor-pointer" size={20} />
            }
            label="Save to your Liked Songs"
            onClick={handleToggleLike}
          />
        )}
        <MenuItem
          startIcon={<BiAddToQueue className="cursor-pointer" size={20} />}
          label="Add to queue"
        />
        <MenuItem
          startIcon={
            <MdOutlinePersonOutline className="cursor-pointer" size={20} />
          }
          label="Go to Artist"
          onClick={() => {
            router.push(`/artists/${song.artist._id}`);
          }}
        />
        {song.album && (
          <MenuItem
            startIcon={<BiAlbum className="cursor-pointer" size={20} />}
            label="Go to Album"
            onClick={() => {
              router.push(`/albums/${song.album._id}`);
            }}
          />
        )}
      </motion.div>
    </div>,
    document.body
  );
}
