import { BsThreeDots } from "react-icons/bs";

import React, { useState, useEffect } from "react";
import Portal from "../Helper/Portal";
import { AnimatePresence } from "framer-motion";
import { TiTick } from "react-icons/ti";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { IoAddSharp } from "react-icons/io5";
import { useTransition } from "react";
import { FiEdit2 } from "react-icons/fi";
import EditSongPopup from "./EditSongPopUp";
import { RiDeleteBin6Line } from "react-icons/ri";
const ArtistSongThreeDots = ({ song, album ,onUpdate}) => {
  const [pending, startTransition] = useTransition();
  const toast = useSpotifyToast();
  const [showPopup, setShowPopup] = useState(false);
  const [anchor, setAnchor] = useState(null);
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showPopup]);

  //   options ---------------------------------------------------

  const handleDeleteSong = (e) => {
    e.stopPropagation();

    if (
      !window.confirm(
        `Are you sure you want to delete the song "${song?.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    const formData = new FormData();
    formData.set("id", song._id);
    startTransition(async () => {
      const res = await fetch("/api/artistDashboard/songs", {
        method: "DELETE",
        body: formData,
      });

      if (!res.ok) {
        toast({ text: "failed" });
        return;
      }

      const result = await res.json();
      if (result) {
        toast({ text: "Song Deleted" });
      }

      // Reload the page after the function completes
      onUpdate()
    });
    setShowPopup(false);
  };

  const handleRemoveSongFromAlbum = (e) => {
    e.stopPropagation();

    const formData = new FormData();
    formData.set("songId", song._id);
    startTransition(async () => {
      const res = await fetch(`/api/artistDashboard/albums/${album._id}`, {
        method: "DELETE",
        body: formData,
      });

      if (!res.ok) {
        toast({ text: "failed" });
        return;
      }

      const result = await res.json();
      if (result) {
        toast({ text: `Song removed from ${album.name}` });
      }

      // Reload the page after the function completes
      onUpdate()
    });
    setShowPopup(false);
  };

  const handleEditSong = () => {
    setShowEditSongPopup(true);
  };
  const [showEditSongPopup, setShowEditSongPopup] = useState(false);

  return (
    <>
      <div>
        <EditSongPopup
          song={song}
          open={showEditSongPopup}
          onClose={() => setShowEditSongPopup(false)}
          onUpdate={onUpdate}
        />
        <span
          className="p-1 transform active:scale-90 hover:scale-110 transition-200 cursor-pointer"
          onClick={(e) => {
            setAnchor(e.currentTarget.getBoundingClientRect());
            setShowPopup(true);
            e.stopPropagation();
            e.preventDefault();
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <BsThreeDots className="text-xl transform rotate-90 sm:rotate-0" />
        </span>
        <AnimatePresence>
          {showPopup && (
            <Portal
              open={showPopup}
              anchorRect={anchor}
              onClose={() => {
                setShowPopup(false);
              }}
            >
              {/* image support */}{" "}
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
                    {song?.album?.name}
                  </div>
                </div>
              </div>
              {/* items support */}
              <MenuItem
                startIcon={
                  <FiEdit2
                    className="text-white text-2xl cursor-pointer"
                    size={20}
                  />
                }
                label="Edit Song Details"
                onClick={handleEditSong}
              />
              {/* items support */}
              {album && (
                <MenuItem
                  startIcon={
                    <RiDeleteBin6Line
                      className="text-white text-2xl cursor-pointer"
                      size={20}
                    />
                  }
                  label="Remove from this album"
                  onClick={handleRemoveSongFromAlbum}
                />
              )}
              <MenuItem
                startIcon={
                  <IoAddSharp
                    className="text-white text-2xl cursor-pointer transform rotate-45"
                    size={20}
                  />
                }
                label="Delete Song"
                onClick={handleDeleteSong}
              />
            </Portal>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ArtistSongThreeDots;

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
