// ===========================
// File: src/components/ProfileThreeDotsPopUp.jsx  (re‑written)
// Spotify‑style three‑dots context menu
// ===========================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BsFillPersonFill } from "react-icons/bs";
import { BsPersonCheck } from "react-icons/bs";
import { LiaUserEditSolid } from "react-icons/lia";
import EditProfileModal from "./EditProfileModal";
import BecomeArtistDialog from "./BecomeArtistDialog";
import { IoIosLogOut } from "react-icons/io";
import { signOut } from "next-auth/react";
import dynamic from "next/dynamic";

// Use dynamic import for Portal to avoid SSR issues, as in artistSongThreeDots
const Portal = dynamic(() => import("../Helper/Portal"), { ssr: false });

const MenuItem = ({ startIcon, endIcon, label, onClick, onDoubleClick }) => (
  <div
    onClick={onClick}
    onDoubleClick={onDoubleClick}
    className=" text-sm w-full px-2 py-2 text-left hover:bg-zinc-600 flex items-center gap-2 rounded-md cursor-pointer select-none"
  >
    <span className="w-5">{startIcon}</span>
    <span className="w-full truncate">{label}</span>
    {endIcon && <span className="w-5">{endIcon}</span>}
  </div>
);

export default function ProfileThreeDotsPopUp({ open, currentUser, anchorRect, onClose }) {
  const router = useRouter();

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
    signOut();
    router.push("/login");
  };

  // For nested popup tracking (childOpen)
  const childOpen = showEditProfilePopup || showBecomeArtistPopup;

  return (
    <Portal
      open={open}
      anchorRect={anchorRect}
      onClose={onClose}
      childOpen={childOpen}
    >
      {/* Nested modals */}
      {showEditProfilePopup && (
        <EditProfileModal
          currentUser={currentUser}
          open={showEditProfilePopup}
          onClose={() => setEditProfilePopup(false)}
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
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      />

      {currentUser && (
        <MenuItem
          startIcon={
            currentUser.isArtist ? (
              <BsPersonCheck className="cursor-pointer" size={20} />
            ) : (
              <BsFillPersonFill className="cursor-pointer" size={20} />
            )
          }
          label={currentUser.isArtist ? "Go to Artist Dashboard" : "Become a Artist"}
          onClick={handleBecomeArtist}
        />
      )}

      <MenuItem
        startIcon={<IoIosLogOut className="cursor-pointer" size={20} />}
        label={`Sign out`}
        onClick={handleSignOut}
      />
    </Portal>
  );
}
