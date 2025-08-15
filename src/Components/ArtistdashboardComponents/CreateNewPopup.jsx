import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import all icons and popups to avoid Next.js build issues
const Portal = dynamic(() => import("../Helper/Portal"), { ssr: false });
const AnimatePresence = dynamic(
  () => import("framer-motion").then((mod) => ({ default: mod.AnimatePresence })),
  { ssr: false }
);
const FiMusic = dynamic(
  () => import("react-icons/fi").then((mod) => mod.FiMusic),
  { ssr: false }
);
const BiAlbum = dynamic(
  () => import("react-icons/bi").then((mod) => mod.BiAlbum),
  { ssr: false }
);
const AddSongPopup = dynamic(() => import("./AddSongPopUp"), { ssr: false });
const AddAlbumPopup = dynamic(() => import("./AddAlbumPopup"), { ssr: false });

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";

const CreateNewPopup = ({ open, onClose, anchorRect, onUpdate }) => {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useSpotifyToast();

  const [showCreateAlbumPopup, setShowCreateAlbumPopup] = useState(false);
  const [showUploadSongPopup, setShowUploadSongPopup] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  const handleShowCreateAlbumPopup = () => {
    setShowCreateAlbumPopup(true);
  };

  const handleShowUploadSongPopup = () => {
    setShowUploadSongPopup(true);
  };

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
