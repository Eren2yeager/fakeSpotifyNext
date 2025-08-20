"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SuggestLightestBgColor } from "@/functions/bgSuggester";
import { useTransition } from "react";
// Yes, Maximize2 and Minimize2 are real React components exported from the "lucide-react" icon library.
// The import statement below imports them as React components:
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import { Maximize2, Minimize2 } from "lucide-react";
import { useOtherContexts } from "@/Contexts/otherContexts";
import LiveSeekbar from "./LiveSeekbar";
import { IoIosArrowDown } from "react-icons/io";
import { usePlayer } from "@/Contexts/playerContext";
import ThreeDotsLoader from "../Helper/ThreeDotsLoader";
/** --------------------------- Core Component ---------------------------- */
function SyncedLyrics({
  lyrics,
  options,

  className,
  lineClasses,
  wantHeading,
  activeLineClasses,
  nonActiveLineClasses,
  previousLineClasses,
}) {
  const {
    autoScroll = true,
    smoothScroll = true,
    highlightClass = "text-white font-bold",
    lineClass = "text-black font-bold ",
    scrollOffset = 0,
  } = options || {};

  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    durationRef,
    currentTimeRef,
    audioRef,
    autoplayEnabled,
    isShuffling,
    repeatMode,
    toggleShuffle,
    cycleRepeat,
    nextTrack,
    prevTrack,
  } = usePlayer();
  const containerRef = useRef(null);
  const lineRefs = useRef([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lighestBg, setLighestBg] = useState(null);
  const [isPending, startTransition] = useTransition();
  const { lyricsFullScreen, setLyricsFullScreen } = useOtherContexts();
  useEffect(() => {
    startTransition(async () => {
      if (currentSong?.image) {
        await SuggestLightestBgColor(currentSong?.image).then((color) => {
          if (color) {
            setLighestBg(color);
          }
        });
      }
    });
  }, [currentSong]);

  const handlePlayPause = () => {
    if (currentSong) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Reset refs array length when lyrics change
  useEffect(() => {
    lineRefs.current = Array(lyrics.length);
  }, [lyrics.length]);

  // Efficient time sync using rAF
  useEffect(() => {
    let rafId;

    const tick = () => {
      const a = audioRef?.current;
      if (!a || !lyrics?.length) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const t = a.currentTime;
      // binary search for current line index
      let lo = 0,
        hi = lyrics.length - 1,
        idx = 0;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (lyrics[mid].time <= t) {
          idx = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      if (idx !== activeIdx) setActiveIdx(idx);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [audioRef, lyrics, activeIdx]);

  // Auto scroll when active line changes
  useEffect(() => {
    if (!autoScroll) return;
    const node = lineRefs.current[activeIdx];
    const container = containerRef.current;
    if (!node || !container) return;

    const behavior = smoothScroll ? "smooth" : "auto";

    // Try to keep the active line near the center
    const containerRect = container.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const offset =
      nodeRect.top -
      containerRect.top -
      containerRect.height / 2 +
      nodeRect.height / 2 +
      scrollOffset;

    container.scrollTo({ top: container.scrollTop + offset, behavior });
  }, [activeIdx, autoScroll, smoothScroll, scrollOffset]);

  // Handler for clicking a lyric line
  const handleLineClick = (time) => {
    if (audioRef && audioRef.current && typeof time === "number") {
      audioRef.current.currentTime = time;
    }
  };

  return (
    <div
      className={`${!lyricsFullScreen && className}  ${
        lyricsFullScreen &&
        "fixed flex flex-col transition-all duration-500 w-full h-full top-0 right-0 left-0 bottom-0 z-100"
      }`}
      style={{ background: lighestBg || "#27272a" }}
    >
      {isPending ? (
        <div className="w-full  h-full flex justify-center items-center">
          <ThreeDotsLoader />
        </div>
      ) : (
        <>
          {wantHeading !== false && (
            <div
              className={`w-full ${lyricsFullScreen ? "h-15" : "h-10"}  backdrop-blur-2xl sticky top-0  px-5 py-3 rounded-t-xl text-md font-bold flex justify-between `}
              style={{ background: lighestBg }}
            >
              {!lyricsFullScreen && (
                <>
                  <div>Lyrics</div>
                  <div>
                    {lyricsFullScreen ? (
                      <button
                        className="p-1  bg-black/50 rounded-full transition flex items-center"
                        title="Minimize2 Lyrics"
                        onClick={() => setLyricsFullScreen(false)}
                      >
                        <Minimize2 size={15} aria-label="Minimize2" />
                      </button>
                    ) : (
                      <button
                        className="  p-1 bg-black/50 rounded-full transition flex items-center"
                        title="Maximize2 Lyrics"
                        onClick={() => setLyricsFullScreen(true)}
                      >
                        <Maximize2 size={15} aria-label="Maximize2" />
                      </button>
                    )}
                  </div>
                </>
              )}
              {lyricsFullScreen && (
                <>
                  <button
                    className="absolute left-0 ml-5 py-1 rounded-full transition flex items-center"
                    title="Maximize2 Lyrics"
                    onClick={() => setLyricsFullScreen(false)}
                  >
                    <IoIosArrowDown size={25} className="" />
                  </button>
                  <div className="text-center w-full h-full mx-5 pb-5">
                    <div className="text-xs text-white w-full truncate">
                      {currentSong?.name}
                    </div>
                    <div className="text-xs text-white/50 w-full truncate">
                      {currentSong?.artist?.name}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <div
            ref={containerRef}
            className=" overflow-y-auto select-none h-full w-full rounded-b-xl relative"
            style={{ background: lighestBg }}
          >
            <div
              className="sticky left-0 top-0 w-full z-0 h-5"
              style={{
                background: `linear-gradient(to bottom, ${lighestBg}, transparent 100%)`,
                zIndex: 10,
              }}
            ></div>

            <div className=" pb-4 space-y-2 overflow-x-hidden ">
              {lyrics.length === 0 && (
                <p className="text-sm text-white/60 text-center">
                  No lyrics available.
                </p>
              )}
              {lyrics.map((l, i) => (
                <div
                  key={`${i}-${l.time}`}
                  ref={(el) => (lineRefs.current[i] = el)}
                  className={`transition-all duration-500 leading-relaxed font-extrabold hover:underline cursor-pointer mx-5  ${lineClasses} ${
                    i < activeIdx
                      ? previousLineClasses
                      : i === activeIdx
                      ? `${
                          activeLineClasses ? activeLineClasses : "text-white"
                        } `
                      : `${
                          nonActiveLineClasses
                            ? nonActiveLineClasses
                            : "text-black"
                        } `
                  }`}
                  onClick={() => handleLineClick(l.time)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Seek to ${l.line}`}
                >
                  {l.line}
                </div>
              ))}
            </div>

            <div
              className="sticky left-0 bottom-0 w-full -z-1 h-5"
              style={{
                background: `linear-gradient(to top, ${lighestBg}, transparent 100%)`,
                zIndex: 10,
              }}
            ></div>
          </div>
          {lyricsFullScreen && (
            <div className="w-[100%] h-fit p-5">
              <div className="w-full">
                <LiveSeekbar showTime={true} />
              </div>
              <div className="text-2xl font-bold flex items-center justify-center">
                <span
                  className="bg-white p-1 rounded-full text-center flex justify-center items-center cursor-pointer"
                  onClick={handlePlayPause}
                >
                  <span>
                    {isPlaying ? (
                      <IoIosPause
                        className=" text-black self-center text-5xl sm:text-2xl  "
                        title="Pause"
                      />
                    ) : (
                      <IoIosPlay
                        className=" text-black self-center text-5xl sm:text-2xl pl-[2px]"
                        title="Play"
                      />
                    )}
                  </span>
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SyncedLyrics;
