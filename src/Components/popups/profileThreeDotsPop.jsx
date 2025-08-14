// ===========================
// File: src/components/ProfileThreeDotsPopUp.jsx  (re‑written)
// Spotify‑style three‑dots context menu
// ===========================

"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion, useDragControls } from "framer-motion";


import { IoAddSharp } from "react-icons/io5";

import { useRouter } from "next/navigation";
import { BsFillPersonFill } from "react-icons/bs";
import { BsPersonCheck } from "react-icons/bs";
import { LiaUserEditSolid } from "react-icons/lia";
/*************************
 * Helper item component  *
 *************************/
import EditProfileModal from "./EditProfileModal";
import BecomeArtistDialog from "./BecomeArtistDialog";
import { IoIosLogOut } from "react-icons/io";
import { signOut } from "next-auth/react";
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

/*************************
 * Main popup component   *
 *************************/
export default function ProfileThreeDotsPopUp({ currentUser, anchorRect, onClose }) {

  const router = useRouter();


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
  const dragControls = useDragControls();
  const startDrag = (event) => {
    if (window.innerWidth > 640) return;
    dragControls.start(event);
  };
  useEffect(() => {
    const handle = (e) => {
      const insideSelf = selfRef.current && selfRef.current.contains(e.target);
      const insideChild = childRef && childRef.contains(e.target);
      if (!insideSelf && !insideChild) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [childRef, onClose]);



  // for background inactivity

  const [showEditProfilePopup, setEditProfilePopup] = useState(false);
  const [showBecomeArtistPopup, setShowBecomeArtistPopup] = useState(false);

  const handleBecomeArtist = () => {
    if (currentUser.isArtist) {
      router.push("/artistDashboard");
    } else {
      setShowBecomeArtistPopup(true);
    }
  };
  const handleSignOut = () => {
    signOut()
    router.push("/login")
  };
 

  
  /* portal render */
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
        initial={window.innerWidth <= 640 && { y: "100%", opacity: 0 }}
        exit={window.innerWidth <= 640 && { y: "-100%", opacity: 0 }}
        animate={window.innerWidth <= 640 && { y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`fixed z-[9999] bg-zinc-800 p-1 text-white rounded-md shadow-lg sm:w-[260px]    w-full transition-transform duration-1000    `}
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
        {" "}
        <div className="h-1.5 w-[40%] sm:hidden mx-auto my-2 rounded-xs flex bg-white/45" onPointerDown={startDrag} />
        {/* // for add to playlist */}
        {/* nested Add‑to‑playlist popup */}
        {showEditProfilePopup && (
          <EditProfileModal
            currentUser={currentUser}
            open={showEditProfilePopup}
            onClose={onClose}
          />
        )}
        {!currentUser?.isArtist && showBecomeArtistPopup && (
          <BecomeArtistDialog
            open={showBecomeArtistPopup}
            onClose={() => setShowBecomeArtistPopup(false)}
          />
        )}

        <MenuItem
          startIcon={<LiaUserEditSolid className="cursor-pointer" size={20} />}
          label="Edit Profile"
          onClick={(e) => {
            e.stopPropagation();
            setEditProfilePopup(true);
            // e.preventDefault()
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        />

        {currentUser && (
          <MenuItem
            startIcon={currentUser.isArtist ? <BsPersonCheck className="cursor-pointer" size={20} /> : <BsFillPersonFill className="cursor-pointer" size={20} />}
            label={`${currentUser.isArtist ? "Go to Artist Dashboard" : "Become a Artist"}`}
            onClick={handleBecomeArtist}
          />
        )}

<MenuItem
            startIcon={<IoIosLogOut className="cursor-pointer" size={20} /> }
            label={`Sign out`}
            onClick={handleSignOut}
          />
      </motion.div>
    </div>,
    document.body
  );
}
