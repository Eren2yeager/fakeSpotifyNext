import React, { useRef, useEffect, useContext, useState } from "react";
import {
  currentTimeContext,
  durationContext,
} from "@/Contexts/audio.controls.";
import { audioRefContext } from "@/Contexts/contexts";
import CustomInputRange from "@/Components/Helper/customInputRange";

const LiveSeekbar = (props) => {
  const ContexCurrentTime = useContext(currentTimeContext);
  const ContextDuration = useContext(durationContext);
  const ContextAudioRef = useContext(audioRefContext);

  const isDragingRef = useRef(false);
  const [localValue, setLocalValue] = useState(0); // show real-time dragging feedback

  // Safely format time (fallback to 0:00)
  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

 

  const handleOnChange = (value) => {
    ContextAudioRef.current.currentTime = value;
    ContexCurrentTime.setCurrentTime(value);
  };

  return (
    <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-2 self-baseline-last">
      {props.showTime && (
        <div className="text-[0.8em] hidden sm:block opacity-60">
          {formatTime(isDragingRef.current ? localValue : ContexCurrentTime.currentTime)}
        </div>
      )}


      <CustomInputRange
        width={props.width}
        value={ContexCurrentTime.currentTime}
        min={0}
        max={ContextDuration.duration}
        onChange={handleOnChange}
        wantThumb={props.wantThumb}
        localState={{localValue, setLocalValue}}
        wantControls={props.wantControls}
        isDragingRef={isDragingRef}
      />

      {/*  for mobile audioComponent view */}
      {props.showTime && (
        <div className="w-full sm:hidden flex justify-between ">
          <div className="text-[0.8em]  sm:block opacity-60 ">
            {formatTime(ContexCurrentTime.currentTime)}
          </div>
          <div className="text-[0.8em]  sm:block opacity-60">
            {formatTime(ContextDuration.duration)}
          </div>
        </div>
      )}

      {props.showTime && (
        <div className="text-[0.8em] hidden sm:block opacity-60">
          {formatTime(ContextDuration.duration)}
        </div>
      )}
    </div>
  );
};

export default React.memo(LiveSeekbar);
