"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useLibrary } from "@/Contexts/libraryContext";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";

// Dynamic import to avoid Next.js build errors with server actions
let isSavedAlbum, toggleSavedAlbum;
const loadAlbumActions = async () => {
  if (!isSavedAlbum || !toggleSavedAlbum) {
    const mod = await import("@/app/(protected)/actions/albumActions");
    isSavedAlbum = mod.isSavedAlbum;
    toggleSavedAlbum = mod.toggleSavedAlbum;
  }
};

const SaveAlbumButton = ({ id, onUpdate }) => {
  const toast = useSpotifyToast();
  const { fetchLibrary } = useLibrary();
  const [pending, startTransition] = useTransition();
  const [isAlbumSaved, setIsAlbumSaved] = useState(null);

  useEffect(() => {
    let isMounted = true;
    startTransition(async () => {
      await loadAlbumActions();
      if (isSavedAlbum && isMounted) {
        const res = await isSavedAlbum(id);
        if (isMounted) setIsAlbumSaved(res);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleClick = () => {
    startTransition(async () => {
      await loadAlbumActions();
      if (toggleSavedAlbum && isSavedAlbum) {
        await toggleSavedAlbum(id);
        const res = await isSavedAlbum(id);
        setIsAlbumSaved(res);
        fetchLibrary();
        if (res === true) {
          toast({ text: "Added to Your Library" });
        } else if (res === false) {
          toast({ text: "Removed from Your Library" });
        }
        if (onUpdate) onUpdate();
      }
    });
  };

  return (
    <button
      title={
        isAlbumSaved
          ? "Remove from the Library"
          : "Save to Library"
      }
      disabled={pending}
      onClick={handleClick}
      className={`
        px-3
        rounded-full
        border-2 border-white/50
        bg-transparent
        text-white
        text-sm
        font-semibold
        transition-all duration-200
        ${pending ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {isAlbumSaved ? "Saved" : "Save"}
    </button>
  );
};

export default SaveAlbumButton;
