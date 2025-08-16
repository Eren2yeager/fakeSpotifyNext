// ===========================
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTransition } from "react";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { useLibrary } from "@/Contexts/libraryContext";
import { usePlayer } from "@/Contexts/playerContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AddToPlaylistPopup from "./AddToPlaylistPopup";
import {
  removeSongFromPlaylist,
  toggleLikeSong,
} from "@/app/(protected)/actions/songActions";

// Dynamically import all icons and Portal to avoid Next.js build issues
const TiTick = dynamic(() =>
  import("react-icons/ti").then((mod) => mod.TiTick), { ssr: false }
);
const IoIosAddCircleOutline = dynamic(() =>
  import("react-icons/io").then((mod) => mod.IoIosAddCircleOutline), { ssr: false }
);
const BiAddToQueue = dynamic(() =>
  import("react-icons/bi").then((mod) => mod.BiAddToQueue), { ssr: false }
);
const IoAddSharp = dynamic(() =>
  import("react-icons/io5").then((mod) => mod.IoAddSharp), { ssr: false }
);
const IoMdArrowDropright = dynamic(() =>
  import("react-icons/io").then((mod) => mod.IoMdArrowDropright), { ssr: false }
);
const RiDeleteBin7Line = dynamic(() =>
  import("react-icons/ri").then((mod) => mod.RiDeleteBin7Line), { ssr: false }
);
const BiAlbum = dynamic(() =>
  import("react-icons/bi").then((mod) => mod.BiAlbum), { ssr: false }
);
const MdOutlinePersonOutline = dynamic(() =>
  import("react-icons/md").then((mod) => mod.MdOutlinePersonOutline), { ssr: false }
);
const Portal = dynamic(() => import("../Helper/Portal"), { ssr: false });

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

export default function ThreeDotsPopUp({
  open,
  song,
  playlistId,
  playlistCreaterId,
  anchorRect,
  onClose,
}) {
  const [liked, setLiked] = useState(false);
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useSpotifyToast();
  const { checkSongIsInLikedSongs, fetchLibrary } = useLibrary();
  const { userInsertQueue, setUserInsertQueue } = usePlayer();
  const [checkInUserInsertedQueue, setCheckInUserInsertedQueue] = useState(null);
  const [isUpdated, setIsUpdated] = useState(false);

  // For nested popup
  const [showAddToPlaylistPopup, setShowAddToPlaylistPopup] = useState(false);
  const [addToPlaylistAnchor, setAddToPlaylistAnchor] = useState(null);

  // Liked check
  const refreshLiked = () =>
    startTransition(async () => {
      const includes = await checkSongIsInLikedSongs(song._id);
      setLiked(!!includes);
    });

  useEffect(() => {
    setIsUpdated(false);
    refreshLiked();
    setCheckInUserInsertedQueue(userInsertQueue.some((s) => s._id === song._id));
  }, [song._id, isUpdated, userInsertQueue]);

  // Remove from playlist
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

  // Like/unlike
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

  // Add/remove from queue
  const toggleAddToQueue = async () => {
    const isInQueue = userInsertQueue.some((s) => s._id === song._id);
    if (isInQueue) {
      setUserInsertQueue((prev) => prev.filter((s) => s._id !== song._id));
      toast({ text: "Removed from queue" });
    } else {
      setUserInsertQueue((prev) => [...prev, song]);
      toast({ text: "Added to queue" });
    }
    setIsUpdated(true);
    onClose();
  };

  return (
    <Portal
      open={open}
      anchorRect={anchorRect}
      onClose={onClose}
      childOpen={showAddToPlaylistPopup}
    >
      <div className="flex gap-1 justify-start ">
        <img
          src={`${song?.image}`}
          className={`min-w-[60px] max-w-[60px] min-h-[60px] max-h-[60px] p-1 object-cover rounded-xl `}
          alt={song?.name}
          title={song?.name}
        />
        <div className="flex flex-col mt-2 h-[30%] w-[100%] justify-start ">
          <div
            className="song-name text-wrap   overflow-hidden text-ellipsis break-words text-sm"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {song?.name}
          </div>
          <div className="song-artist  lg:text-wrap max-w-[95%]  lg:max-h-[3em] overflow-hidden truncate opacity-70 text-xs">
            {song?.artist?.name}
          </div>
        </div>
      </div>
      {/* Add to playlist */}
      <MenuItem
        startIcon={<IoAddSharp className="cursor-pointer" size={20} />}
        endIcon={<IoMdArrowDropright className="cursor-pointer" size={20} />}
        label="Add to playlist"
        onClick={(e) => {
          e.stopPropagation();
          setAddToPlaylistAnchor(e.currentTarget.getBoundingClientRect());
          setShowAddToPlaylistPopup(true);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      />
      {/* Nested AddToPlaylistPopup */}
      {showAddToPlaylistPopup && (
        <AddToPlaylistPopup
          song={song}
          anchorRect={addToPlaylistAnchor}
          onClose={() => setShowAddToPlaylistPopup(false)}
        />
      )}
      {playlistId && playlistCreaterId == session?.user._id && (
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
      {checkInUserInsertedQueue ? (
        <MenuItem
          startIcon={
            <RiDeleteBin7Line
              className="cursor-pointer"
              size={20}
            />
          }
          label="Remove from Queue"
          onClick={toggleAddToQueue}
        />
      ) : (
        <MenuItem
          startIcon={
            <BiAddToQueue className="cursor-pointer" size={20} />
          }
          label="Add to Queue"
          onClick={toggleAddToQueue}
        />
      )}
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
    </Portal>
  );
}
