import { BsThreeDots } from "react-icons/bs";

import React, { useState, useEffect, useRef } from "react";
import Portal from "../Helper/Portal";
import { AnimatePresence } from "framer-motion";
import { TiTick } from "react-icons/ti";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { IoAddSharp } from "react-icons/io5";
import { useTransition } from "react";
import { FiEdit2 } from "react-icons/fi";
import { BiAlbum } from "react-icons/bi";
import { FiMusic } from "react-icons/fi";
// import EditSongPopup from "./EditSongPopUp";
import AddSongToAlbumPopup from "./addSongToAlbum";
import EditALbumPopup from "./EditAlbumPopUp";
import { usePathname, useRouter } from "next/navigation";
import AddSongPopup from "./AddSongPopUp";
import AddAlbumPopup from "./AddAlbumPopup";

const CreateNewPopup = ({ open, onClose, anchorRect , onUpdate}) => {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useSpotifyToast();
  const [showPopup, setShowPopup] = useState(false);

  const [childRef, setChildRef] = useState(null); // <-- track nested popup DOM

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  //   options ---------------------------------------------------

  const handleShowCreateAlbumPopup = () => {
    setShowCreateAlbumPopup(true);
  };

  const handleShowUploadSongPopup = () => {
    setShowUploadSongPopup(true);
  };
  const [showCreateAlbumPopup, setShowCreateAlbumPopup] = useState(false);
  const [showUploadSongPopup, setShowUploadSongPopup] = useState(false);

  return (
    <>
      <div>
        <AnimatePresence>
          {open && (
            <Portal open={open} anchorRect={anchorRect} onClose={onClose}>
              {showUploadSongPopup && (
                <AddSongPopup
                  open={showUploadSongPopup}
                  onClose={() => {
                    setShowUploadSongPopup(false);
                  }}
                  onUpdate={onUpdate}
                />
              )}
              {showCreateAlbumPopup && (
                <AddAlbumPopup
                  open={showCreateAlbumPopup}
                  onClose={() => {
                    setShowCreateAlbumPopup(false);
                  }}
                  onUpdate={onUpdate}
                />
              )}
              {/* image support */}{" "}
              <div className="h-1.5 w-[40%] sm:hidden mx-auto my-1 rounded-xs flex bg-white/45 " />
              <MenuItem
                startIcon={
                  <FiMusic
                    className="text-white text-2xl cursor-pointer"
                    size={20}
                  />
                }
                label="Add Song"

                onClick={handleShowUploadSongPopup}
              />
              <MenuItem
                startIcon={
                  <BiAlbum
                    className="text-white text-2xl cursor-pointer transform rotate-45"
                    size={20}
                  />
                }
                label="Create Album"
                onClick={handleShowCreateAlbumPopup}
              />
            </Portal>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default CreateNewPopup;

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
