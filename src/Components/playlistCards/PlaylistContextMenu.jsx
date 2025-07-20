"use client";

import { useEffect, useRef, useState } from "react";

export default function PlaylistContextMenu({ onEdit, onDelete, triggerRef }) {
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
        openMenu(window.innerWidth / 2, window.innerHeight / 2);
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
    <div
      id="playlist-context-menu"
      className="absolute bg-zinc-700 p-1 text-white rounded-md shadow-lg sm:w-60 z-100  w-full"
      style={
        window.innerWidth >= 640
          ? { top: coords.y - 100, left: coords.x }
          : { bottom: "0", left: "0" }
      }
    >
      <button
        onClick={() => {
          setVisible(false);
          onEdit();
        }}
        className="w-full px-4 py-2 text-left hover:bg-zinc-600 flex items-center gap-1 rounded-md"
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
        className="w-full px-4 py-2 text-left  hover:bg-zinc-600 flex items-center gap-1 rounded-md"
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
    </div>
  );
}
