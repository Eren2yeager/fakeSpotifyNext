"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotFound from "../Helper/not-found";

export default function PlaylistContextMenu({
  playlist,
  onEdit,
  onDelete,
  triggerRef,
  
}) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef(null);

  useEffect(() => {
    const trigger = triggerRef?.current;
    if (!trigger) return;

    const openMenu = (x, y) => {
      const menuWidth = 192; // adjust to your actual width
      const menuHeight = 96; // adjust to your actual height

      const padding = 10;

      let newX = x;
      let newY = y;

      // Flip horizontally if overflowing right
      if (x + menuWidth + padding > window.innerWidth) {
        newX = window.innerWidth - menuWidth - padding;
      }

      // Flip vertically if overflowing bottom
      if (y + menuHeight + padding > window.innerHeight) {
        newY = y - menuHeight;
        if (newY < 0) newY = padding; // fallback in extreme case
      }

      setCoords({ x: newX, y: newY });
      setVisible(true);
    };

    const handleRightClick = (e) => {
      e.preventDefault();
      openMenu(e.clientX, e.clientY);
    };

    const handleTouchStart = () => {
      timeoutRef.current = setTimeout(() => {
        // rightNavRef.current.classList.remove("shadow-xl", "shadow-gray-950");
        openMenu(window.innerWidth / 2, window.innerHeight / 2);
        timeoutRef.current.classList.add("bg-black");
      }, 500);
    };

    const handleTouchEnd = () => {
      clearTimeout(timeoutRef.current);
    };

    const handleClickOutside = (e) => {
      if (
        !e.target.closest("#playlist-context-menu") &&
        !trigger.contains(e.target)
      ) {
        setVisible(false);
      }
    };

    trigger.addEventListener("contextmenu", handleRightClick);
    trigger.addEventListener("touchstart", handleTouchStart);
    trigger.addEventListener("touchend", handleTouchEnd);

    if (visible) {
      window.addEventListener("mousedown", handleClickOutside); // ✅ more reliable than click
      window.addEventListener("contextmenu", handleClickOutside); // ✅ to close on right-click elsewhere
    }

    return () => {
      trigger.removeEventListener("contextmenu", handleRightClick);
      trigger.removeEventListener("touchstart", handleTouchStart);
      trigger.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("contextmenu", handleClickOutside);
    };
  }, [triggerRef, visible]); // ✅ include visible in deps

  if (!visible) return null;

  return (
    <motion.div
      initial={window.innerWidth <= 640 && { y: 300, opacity: 0 }}
      exit={window.innerWidth <= 640 && { y: -200, opacity: 0 }}
      animate={window.innerWidth <= 640 && { y: 0, opacity: 1 }}
      transition={
        window.innerWidth <= 640 && { duration: 0.6, ease: "easeOut" }
      }
      id="playlist-context-menu"
      className={`absolute bg-zinc-800 p-1 text-white rounded-md shadow-lg sm:w-60 z-100  w-full transition-transform duration-1000    `}
      style={
        window.innerWidth >= 640
          ? { top: coords.y - 100, left: coords.x }
          : { bottom: "0", left: "0" }
      }
      drag={window.innerWidth <= 640 ? "y" : false}
      dragConstraints={{ top: 0, bottom: 300 }}
      onDragEnd={(event, info) => {
        if (window.innerWidth <= 640 && info.offset.y > 100) {
          setTimeout(() => {
            setVisible(false); // ✅ call when dragged down enough
          }, 1000);
        }
      }}
    > <div className="h-1.5 w-[40%] sm:hidden mx-auto my-1 rounded-xs flex bg-white/45 "/>
      {" "}
      <div className="flex gap-1 justify-start items-center">
        <img
          src={`${playlist?.image}`}
          className={`min-w-[60px] max-w-[60px] min-h-[60px] max-h-[60px] p-1 object-cover rounded-xl `}
          alt={playlist?.name}
          title={playlist?.name}
        />
        <p
          className="text-wrap   overflow-hidden text-ellipsis break-words p-1"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
          }}
        >
          {playlist?.name}
        </p>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          onEdit();
        }}
        className="w-full px-4 py-2 text-left hover:bg-zinc-600 flex items-center gap-5 justify-start rounded-md"
      >
        <lord-icon
          src="https://cdn.lordicon.com/exymduqj.json"
          trigger="hover"
          stroke="bold"
          state="hover-line"
          colors="primary:#ffffff,secondary:#e4e4e4"
          style={{ width: "20px", height: "20px" }}
        ></lord-icon>
        <span>Edit details</span>
      </button>
      <button
        onClick={() => {
          setVisible(false);
          if (confirm("Are you sure you want to delete this playlist?")) {
            onDelete();
          }
        }}
        className="w-full px-4 py-2 text-left  hover:bg-zinc-600 flex items-center gap-5 justify-start  rounded-md"
      >
        <lord-icon
          src="https://cdn.lordicon.com/jzinekkv.json"
          trigger="hover"
          stroke="bold"
          colors="primary:#ffffff,secondary:#e4e4e4"
          style={{ width: "20px", height: "20px" }}
        ></lord-icon>
        <span>Delete</span>
      </button>
      
    </motion.div>
  );
}
