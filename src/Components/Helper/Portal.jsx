// ===========================
// File: src/components/ThreeDotsPopUp.jsx  (re‑written)
// Spotify‑style three‑dots context menu
// ===========================

"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion ,AnimatePresence, useDragControls } from "framer-motion";




export default function Portal({
  open,
  anchorRect,
  onClose,
  children
}) {

  
  const [childRef, setChildRef] = useState(null); // <-- track nested popup DOM
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




  /* drag controls and handle-only dismiss on mobile */
  const dragControls = useDragControls();
  const startDrag = (event) => {
    if (window.innerWidth > 640) return;
    dragControls.start(event);
  };

  /* portal render */
  return createPortal(
    <div
      className={`fixed  inset-0 z-[1000] bg-black/45 sm:bg-transparent ${open ? "" : "hidden"}`}
      onClick={(e) => {
        e.stopPropagation(); // prevent event from reaching things behind
        onClose()
      }}
    >
      <motion.div
        ref={selfRef}
        initial={window.innerWidth <= 640 && { y: "100%", opacity: 0 }}
        exit={window.innerWidth <= 640 && { y: "-100%", opacity: 0 }}
        animate={window.innerWidth <= 640 && { y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`fixed z-[9999] bg-zinc-800 p-1 text-white rounded-md shadow-lg sm:max-w-60    w-full transition-transform duration-1000    `}
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
        {children}
      </motion.div>
    </div>,
    document.body
  );
}
