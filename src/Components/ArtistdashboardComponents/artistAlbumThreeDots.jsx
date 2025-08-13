"use client";
import { BsThreeDots } from "react-icons/bs";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { IoAddSharp } from "react-icons/io5";
import { useTransition } from "react";
import { FiEdit2 } from "react-icons/fi";
import { usePathname, useRouter } from "next/navigation";

// Dynamically import Portal and EditAlbumPopup to avoid Next.js build issues
const Portal = dynamic(() => import("../Helper/Portal"), { ssr: false });
const EditALbumPopup = dynamic(() => import("./EditAlbumPopUp"), { ssr: false });
// If you want to use AddSongToAlbumPopup, also import it dynamically as below:
// const AddSongToAlbumPopup = dynamic(() => import("./addSongToAlbum"), { ssr: false });

const ArtistAlbumThreeDots = ({ album, onUpdate }) => {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useSpotifyToast();
  const [showPopup, setShowPopup] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const [childRef, setChildRef] = useState(null);

  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showPopup]);

  const handleRemoveAlbum = (e) => {
    e.stopPropagation();

    if (
      !window.confirm(
        `Are you sure you want to delete the song "${album?.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    const formData = new FormData();
    formData.set("id", album._id);
    startTransition(async () => {
      const res = await fetch("/api/artistDashboard/albums", {
        method: "DELETE",
        body: formData,
      });

      if (!res.ok) {
        toast({ text: "failed" });
        setShowPopup(false);
        return;
      }

      const result = await res.json();
      if (result) {
        toast({ text: "Album Deleted" });
        setShowPopup(false);
      }

      if (pathname === `/artistDashboard/albums/${album._id}`) {
        router.back();
      }

      onUpdate();
      // onClose is not defined, so just close the popup
      setShowPopup(false);
    });
  };

  const handleEditAlbum = () => {
    setShowEditaAlbumPopup(true);
  };

  // const handleAddSongs = () => {
  //   setShowAddSongsPopup(true);
  // };
  const [showEditAlbumPopup, setShowEditaAlbumPopup] = useState(false);
  // const [showAddSongsPopup, setShowAddSongsPopup] = useState(false);

  return (
    <>
      <div>
        <span
          className="transform active:scale-90 hover:scale-110 transition-200 cursor-pointer"
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
              <EditALbumPopup
                album={album}
                open={showEditAlbumPopup}
                onClose={() => setShowEditaAlbumPopup(false)}
                onUpdate={onUpdate}
                setOuterRef={setChildRef}
              />
              {/* If you want to enable AddSongToAlbumPopup, use dynamic import and uncomment below:
              {showAddSongsPopup && (
                <AddSongToAlbumPopup
                  album={album}
                  anchorRect={anchor}
                  open={showAddSongsPopup}
                  onClose={() => {
                    setShowAddSongsPopup(false);
                  }}
                />
              )} */}
              <div className="h-1.5 w-[40%] sm:hidden mx-auto my-1 rounded-xs flex bg-white/45 " />
              <div className="flex gap-1 justify-start ">
                <img
                  src={`${album?.image}`}
                  className={`min-w-[60px] max-w-[60px] min-h-[60px] max-h-[60px] p-1 object-cover rounded-xl `}
                  alt={album?.name}
                  title={album?.name}
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
                    {album?.name}
                  </div>
                </div>
              </div>
              <MenuItem
                startIcon={
                  <FiEdit2
                    className="text-white text-2xl cursor-pointer"
                    size={20}
                  />
                }
                label="Edit Album Details"
                onClick={handleEditAlbum}
              />
              <MenuItem
                startIcon={
                  <IoAddSharp
                    className="text-white text-2xl cursor-pointer transform rotate-45"
                    size={20}
                  />
                }
                label="Delete Album"
                onClick={handleRemoveAlbum}
              />
            </Portal>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ArtistAlbumThreeDots;

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
