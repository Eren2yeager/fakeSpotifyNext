"use client";
import { useState, useEffect } from "react";
import Script from "next/script";

export default function CreatePlaylistPopup({
  onCreate,
  onClose,
  className,
  trigger,
}) {
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!trigger.current?.contains(e.target)) {
        onClose();
      }
    };

    window.addEventListener("mousedown", handleClickOutside); // ✅ more reliable than click
    window.addEventListener("contextmenu", handleClickOutside); // ✅ to close on right-click elsewhere

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("contextmenu", handleClickOutside);
    };
  }); // ✅ include visible in deps

  return (
    <div className={className}>
      <div
        onClick={() => {
          onCreate();
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
          <p className="text-xs text-slate-400">Build a playlist with songs</p>
        </div>
      </div>
      <div className="h-0.5 w-full  bg-white/8"></div>
    </div>
  );
}
