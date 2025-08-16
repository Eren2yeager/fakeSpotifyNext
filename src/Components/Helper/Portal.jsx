"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

/**
 * Simple Portal with drag-to-close on mobile.
 * - On mobile, user can drag the popup down to close.
 * - On desktop, it's a fixed context menu.
 */

export default function Portal({
  open,
  anchorRect,
  onClose,
  children,
  childOpen
}) {
  // // For nested popups (not used here, but kept for compatibility)
  // const [childRef, setChildRef] = useState(null);

  // Positioning for desktop
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (!anchorRect) return;
    const { innerWidth, innerHeight } = window;
    const w = 260, h = 210;
    let top = anchorRect.bottom + 6;
    let left = anchorRect.left;
    if (left + w > innerWidth) left = innerWidth - w - 8;
    if (top + h > innerHeight) top = anchorRect.top - h - 6;
    if (top < 8) top = 8;
    setCoords({ top, left });
  }, [anchorRect]);

  // Click outside to close
  const selfRef = useRef(null);
  useEffect(() => {
    const handle = (e) => {
      const insideSelf = selfRef.current && selfRef.current.contains(e.target);

      if (!insideSelf &&  !childOpen) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [childOpen, onClose]);

  // Mobile detection
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;

  // Simple drag-to-close for mobile
  // If user drags down more than 100px, close
  function handleDragEnd(e, info) {
    if (isMobile && !childOpen && info.offset.y > 100) {
      setTimeout(onClose, 100);
    }
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[1000] bg-black/45 sm:bg-transparent ${open ? "" : "hidden"}`}
      onClick={e => {
        e.stopPropagation();
        onClose();
      }}
    >
      <motion.div
        ref={selfRef}
        initial={isMobile ? { y: "100%", opacity: 0 } : false}
        exit={isMobile ? { y: "-100%", opacity: 0 } : false}
        animate={isMobile ? { y: 0, opacity: 1 } : false}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`fixed z-[9999] bg-zinc-800 p-1 text-white rounded-md shadow-lg sm:max-w-65 w-full transition-transform duration-1000`}
        drag={isMobile && !childOpen ? "y" : false}
        dragConstraints={{ top: 0, bottom: 300 }}
        onDragEnd={handleDragEnd}
        style={
          !isMobile
            ? { top: coords.top, left: coords.left }
            : { bottom: "0" }
        }
        onClick={e => e.stopPropagation()}
        onDoubleClick={e => e.stopPropagation()}
      >
        {/* Simple drag handle for mobile */}
        {isMobile && (
          <div
            className="h-1.5 w-[40%] sm:hidden mx-auto my-2 rounded-xs flex bg-white/45 cursor-grab active:cursor-grabbing"
          />
        )}
        {children}
      </motion.div>
    </div>,
    document.body
  );
}

