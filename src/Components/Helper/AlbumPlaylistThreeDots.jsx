import { BsThreeDots } from "react-icons/bs";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { usePlayer } from "@/Contexts/playerContext";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";

const AlbumPlaylistThreeDots = ({ item, type }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const { addToQueue, playNext } = usePlayer();
  const toast = useSpotifyToast();
  
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showPopup]);

  const handleAddToQueue = async () => {
    try {
      const res = await fetch(`/api/play/${type}/${item._id}`);
      const data = await res.json();
      
      if (data.songs && data.songs.length > 0) {
        addToQueue(data.songs);
        toast.showToast("Added to queue", "success");
      }
    } catch (err) {
      console.error("Failed to add to queue:", err);
      toast.showToast("Failed to add to queue", "error");
    }
    setShowPopup(false);
  };

  const handlePlayNext = async () => {
    try {
      const res = await fetch(`/api/play/${type}/${item._id}`);
      const data = await res.json();
      
      if (data.songs && data.songs.length > 0) {
        playNext(data.songs);
        toast.showToast("Added to play next", "success");
      }
    } catch (err) {
      console.error("Failed to add to play next:", err);
      toast.showToast("Failed to add to play next", "error");
    }
    setShowPopup(false);
  };

  return (
    <>
      <span
        className="transform active:scale-90 transition-200 cursor-pointer"
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
      
      {showPopup && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="absolute bg-zinc-800 text-white rounded-md shadow-lg p-2 min-w-[200px]"
            style={{
              top: anchor?.top + anchor?.height + 5,
              left: anchor?.left - 200 + anchor?.width,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handlePlayNext}
              className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm"
            >
              Play next
            </button>
            <button
              onClick={handleAddToQueue}
              className="w-full text-left px-3 py-2 hover:bg-white/10 rounded text-sm"
            >
              Add to queue
            </button>
          </div>
        </motion.div>,
        document.body
      )}
    </>
  );
};

export default AlbumPlaylistThreeDots;
