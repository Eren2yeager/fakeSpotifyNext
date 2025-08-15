import React, { useEffect, useRef } from "react";

// Spotify green
const SPOTIFY_GREEN = "#1DB954";

const CircularGreenLoader = () => {
  const spinnerRef = useRef(null);

  useEffect(() => {
    // Optional: for accessibility, you could announce loading here
    return () => {};
  }, []);

  return (
    <div
      className="flex items-center justify-center"
      style={{
        minWidth: 40,
        minHeight: 40,
        background: "transparent",
      }}
      aria-label="Loading"
      role="status"
    >
      <svg
        ref={spinnerRef}
        width={44}
        height={44}
        viewBox="0 0 44 44"
        fill="none"
        style={{
          display: "block",
        }}
      >
        <circle
          cx="22"
          cy="22"
          r="18"
          stroke="#222"
          strokeWidth="4"
          opacity="0.18"
        />
        <circle
          cx="22"
          cy="22"
          r="18"
          stroke={SPOTIFY_GREEN}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="90 60"
          strokeDashoffset="0"
          style={{
            transformOrigin: "center",
            animation: "spotify-spin 1s linear infinite",
   
          }}
        />
        <style>{`
          @keyframes spotify-spin {
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </svg>
    </div>
  );
};

export default React.memo(CircularGreenLoader);