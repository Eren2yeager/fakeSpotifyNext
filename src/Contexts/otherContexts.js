"use client";
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const otherContexts = createContext();

export const useOtherContexts = () => useContext(otherContexts);

/* ------------------------------
  Provider Component
------------------------------ */
export function OtherContextsProvider({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showRight, setShowRight] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [imagefullViewSrc, setImagefullViewSrc] = useState(null);
  const [middleWidth, setMiddleWidth] = useState(0);
  const [searchedText, setSearchedText] = useState("");
  // toggleFullScreen state is synced with the "toggleFullScreen" query param in the URL
  const [lyricsFullScreen, setLyricsFullScreenState] = useState(false);
  const [toggleFullScreen, setToggleFullScreenState] = useState(false);

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const params = new URLSearchParams(window.location.search);
  //     const toggleFullScreenQuery = params.get("toggleFullScreen");
  //     setToggleFullScreenState(toggleFullScreenQuery === "true");

  //     const lyricsFullScreenQuery = params.get("lyricsFullScreen");
  //     setLyricsFullScreenState(lyricsFullScreenQuery === "true");
  //   }
  // }, [searchParams]); // re-run when router changes (URL changes)

  // When you want to update toggleFullScreen, update the URL (which will update state via useEffect)
  // Using AbortController can help prevent overlapping router.push calls,
  // but it may not fully prevent route freeze if the router implementation
  // does not handle rapid repeated navigation gracefully.
  // It helps by aborting previous navigation requests, but if the user clicks
  // extremely rapidly, some router.push calls may still queue up.
  // For best UX, consider also disabling the button while navigation is pending.

  // let setToggleFullScreenAbortController = null;
  const setToggleFullScreen = (value) => {
    // if (typeof window !== "undefined" && router) {
    //   // Abort any previous navigation if still pending
    //   if (setToggleFullScreenAbortController) {
    //     setToggleFullScreenAbortController.abort();
    //   }
    //   setToggleFullScreenAbortController = new AbortController();

    //   const params = new URLSearchParams(window.location.search);
    //   params.set("toggleFullScreen", value ? "true" : "false");
    //   const newUrl =
    //     window.location.pathname +
    //     (params.toString() ? `?${params.toString()}` : "");
    //   try {
    //     // The signal option will abort the previous navigation if still pending.
    //     // This reduces the chance of route freeze, but is not a 100% guarantee.
    //     router.replace(newUrl, { scroll: false, signal: setToggleFullScreenAbortController.signal });
    //   } catch (e) {
    //     // If signal not supported, fallback to normal push
    //     router.replace(newUrl, { scroll: false });
    //   }
      setToggleFullScreenState(value);
    // }
  };

  // When you want to update lyricsFullScreen, update the URL (which will update state via useEffect)
  // let setLyricsFullScreenAbortController = null;
  const setLyricsFullScreen = (value) => {
    // if (typeof window !== "undefined" && router) {
    //   // Abort any previous navigation if still pending
    //   if (setLyricsFullScreenAbortController) {
    //     setLyricsFullScreenAbortController.abort();
    //   }
    //   setLyricsFullScreenAbortController = new AbortController();

    //   const params = new URLSearchParams(window.location.search);
    //   params.set("lyricsFullScreen", value ? "true" : "false");
    //   const newUrl =
    //     window.location.pathname +
    //     (params.toString() ? `?${params.toString()}` : "");
    //   try {
    //     router.replace(newUrl, { scroll: false, signal: setLyricsFullScreenAbortController.signal });
    //   } catch (e) {
    //     // If signal not supported, fallback to normal push
    //     router.replace(newUrl, { scroll: false });
    //   }
      setLyricsFullScreenState(value);
    // }
  };

  return (
    <otherContexts.Provider
      value={{
        toggleFullScreen,
        setToggleFullScreen,
        showRight,
        setShowRight,
        showLibrary,
        setShowLibrary,
        imagefullViewSrc,
        setImagefullViewSrc,
        middleWidth,
        setMiddleWidth,
        searchedText,
        setSearchedText,
        lyricsFullScreen,
        setLyricsFullScreen
      }}
    >
      {children}
    </otherContexts.Provider>
  );
}
