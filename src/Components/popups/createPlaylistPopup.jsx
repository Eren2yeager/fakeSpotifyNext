"use client";
import { useState, useEffect , useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useDragControls } from "framer-motion";
import { createPlaylistForUser } from "@/app/(protected)/actions/playlistActions";
import { useLibrary } from "@/Contexts/libraryContext";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { AnimatePresence } from "framer-motion";
export default function CreatePlaylistPopup({ onClose, anchorRect }) {
  const [childRef, setChildRef] = useState(null); // <-- track nested popup DOM
  const toast =useSpotifyToast();
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

  const { fetchLibrary } = useLibrary();
  const dragControls = useDragControls();
  const startDrag = (event) => {
    if (window.innerWidth > 640) return;
    dragControls.start(event);
  };

  const handleCreate = async () => {
    const newPl = await createPlaylistForUser();
    if (newPl) {
      toast({
        text: `New Playlist Created: ${newPl.name}`,
        image: newPl.image,
      });
      fetchLibrary();
    }
  };

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
        initial={window.innerWidth <= 640 ? { y: "100%", opacity: 0 } : false}
        exit={window.innerWidth <= 640 ? { y: "100%", opacity: 0 } : false}
        animate={window.innerWidth <= 640 ? { y: 0, opacity: 1 } : false}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`fixed z-[9999] bg-zinc-800 p-1 text-white rounded-md shadow-lg sm:w-[260px] w-full  transition-transform duration-1000`}
        drag={window.innerWidth <= 640 ? "y" : false}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={(event, info) => {
          if (window.innerWidth <= 640 && (info.offset.y > 180 || info.velocity.y > 1200)) onClose();
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
        <div className="h-1.5 w-[40%] sm:hidden mx-auto my-2 rounded-xs flex bg-white/45" onPointerDown={startDrag} />

        <div
          onClick={() => {
            handleCreate();
            onClose();
          }}
          className="flex gap-3 items-center cursor-pointer hover:bg-white/8 p-2 rounded-md transition-all"
        >  

          <div className="bg-zinc-500 p-2 rounded-full flex items-center justify-center">
            <lord-icon
              src="https://cdn.lordicon.com/cqefxcni.json"
              trigger="loop"
              delay="2000"
              stroke="bold"
              colors="primary:#ffffff,secondary:#e4e4e4"
              style={{ width: "20px", height: "20px" }}
            ></lord-icon>
          </div>
          <div>
            <p className="font-semibold text-sm">Playlist</p>
            <p className="text-xs text-white/70">Build a playlist with songs</p>
          </div>
          {/* <div className="h-0.5 w-full  bg-white/8"></div> */}
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
