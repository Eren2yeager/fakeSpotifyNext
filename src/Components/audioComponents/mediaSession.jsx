"use client";
import { useEffect } from "react";

export default function MediaSession({ song, onPlay, onPause, onNext, onPrevious }) {
  useEffect(() => {
    if (!("mediaSession" in navigator) || !song) return;

    // Update metadata
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song?.name,
      artist: song?.artist?.name,
      album: song?.album?.name || "",
      artwork: [
        { src: song.image, sizes: "96x96", type: "image/png" },
        { src: song.image, sizes: "128x128", type: "image/png" },
        { src: song.image, sizes: "192x192", type: "image/png" },
        { src: song.image, sizes: "256x256", type: "image/png" },
        { src: song.image, sizes: "384x384", type: "image/png" },
        { src: song.image, sizes: "512x512", type: "image/png" },
      ]
    });

    // Set action handlers
    navigator.mediaSession.setActionHandler("play", () => onPlay && onPlay());
    navigator.mediaSession.setActionHandler("pause", () => onPause && onPause());
    navigator.mediaSession.setActionHandler("nexttrack", () => onNext && onNext());
    navigator.mediaSession.setActionHandler("previoustrack", () => onPrevious && onPrevious());

    // Cleanup on unmount
    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
    };
  }, [song, onPlay, onPause, onNext, onPrevious]);

  return null; // No UI needed
}
