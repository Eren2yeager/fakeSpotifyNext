import React, { useRef, useEffect, useContext, useState } from "react";

import CustomInputRange from "@/Components/Helper/customInputRange";
import { usePlayer } from "@/Contexts/playerContext";

const LiveSeekbar = (props) => {
  const { currentSong, isPlaying, setIsPlaying, durationRef, currentTimeRef, audioRef } = usePlayer();
  const isDragingRef = useRef(false);
  const [localValue, setLocalValue] = useState(0); // show real-time dragging feedback

  // State to force re-render on time update
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Update currentTime and duration from refs at a regular interval
  useEffect(() => {
    // If no audioRef, do nothing
    if (!audioRef.current) return;

    // Handler to update state from refs
    const update = () => {
      setCurrentTime(currentTimeRef.current || 0);
      setDuration(durationRef.current || 0);
    };

    // Use requestAnimationFrame for smooth updates
    let animationFrameId;
    const tick = () => {
      update();
      animationFrameId = requestAnimationFrame(tick);
    };
    tick();

    // Clean up
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
    // Only rerun if audioRef changes (should be stable from context)
    // eslint-disable-next-line
  }, [audioRef]);

  // Safely format time (fallback to 0:00)
  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleOnChange = (value) => {
    audioRef.current.currentTime = value;
    currentTimeRef.current = value;
    setCurrentTime(value); // update local state immediately for UI feedback
  };

  return (
    <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-2 self-baseline-last">
      {props.showTime && (
        <div className="text-[0.8em] hidden sm:block opacity-60">
          {formatTime(isDragingRef.current ? localValue : currentTime)}
        </div>
      )}

      <CustomInputRange
        width={props.width}
        value={currentTime}
        min={0}
        max={duration}
        onChange={handleOnChange}
        wantThumb={props.wantThumb}
        localState={{ localValue, setLocalValue }}
        wantControls={props.wantControls}
        isDragingRef={isDragingRef}
      />

      {/*  for mobile audioComponent view */}
      {props.showTime && (
        <div className="w-full sm:hidden flex justify-between ">
          <div className="text-[0.8em]  sm:block opacity-60 ">
            {formatTime(currentTime)}
          </div>
          <div className="text-[0.8em]  sm:block opacity-60">
            {formatTime(duration)}
          </div>
        </div>
      )}

      {props.showTime && (
        <div className="text-[0.8em] hidden sm:block opacity-60">
          {formatTime(duration)}
        </div>
      )}
    </div>
  );
};

export default React.memo(LiveSeekbar);
