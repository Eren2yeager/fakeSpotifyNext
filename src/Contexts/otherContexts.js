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
import { useNavWatchdog } from "./NavWatchdogContext";
import { useSpotifyToast } from "./SpotifyToastContext";

const otherContexts = createContext();

export const useOtherContexts = () => useContext(otherContexts);

/* ------------------------------
  Provider Component
------------------------------ */
export function OtherContextsProvider({ children }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nav = useNavWatchdog && useNavWatchdog();
  const toast = useSpotifyToast && useSpotifyToast();

  const [showRight, setShowRight] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [imagefullViewSrc, setImagefullViewSrc] = useState(null);
  const [middleWidth, setMiddleWidth] = useState(0);
  const [searchedText, setSearchedText] = useState("");
  // toggleFullScreen state is synced with the "toggleFullScreen" query param in the URL
  const [lyricsFullScreen, setLyricsFullScreenState] = useState(false);
  const [toggleFullScreen, setToggleFullScreenState] = useState(false);

  // Debounce timers for URL updates
  const toggleFullScreenTimerRef = useRef(null);
  const lyricsFullScreenTimerRef = useRef(null);

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const params = new URLSearchParams(window.location.search);
  //     const toggleFullScreenQuery = params.get("toggleFullScreen");
  //     setToggleFullScreenState(toggleFullScreenQuery === "true");

  //     const lyricsFullScreenQuery = params.get("lyricsFullScreen");
  //     setLyricsFullScreenState(lyricsFullScreenQuery === "true");
  //   }
  // }, [searchParams]); // re-run when router changes (URL changes)

  // Debounced URL update function (supports push or replace)
  const updateURLParam = useCallback((paramName, value, mode = "replace") => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    params.set(paramName, value ? "true" : "false");
    const newUrl =
      window.location.pathname + (params.toString() ? `?${params.toString()}` : "");

    try {
      if (mode === "push") {
        router.push(newUrl, { scroll: false });
      } else {
        router.replace(newUrl, { scroll: false });
      }
    } catch (e) {
      // Fallback to history API if router errors
      if (mode === "push") {
        window.history.pushState({}, "", newUrl);
      } else {
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [router]);

  // When you want to update toggleFullScreen, update the URL with debouncing
  const setToggleFullScreen = useCallback((value) => {
    // Update state immediately for responsive UI
    setToggleFullScreenState(value);
    
    // // Clear existing timer
    // if (toggleFullScreenTimerRef.current) {
    //   clearTimeout(toggleFullScreenTimerRef.current);
    // }
    
    // // Debounce URL update to prevent rapid changes
    // toggleFullScreenTimerRef.current = setTimeout(() => {
    //   const mode = value ? "push" : "replace"; // open -> push, close -> replace
    //   if (nav && nav.updateQueryParamDebounced) {
    //     nav.updateQueryParamDebounced("toggleFullScreen", value, mode, {
    //       // onStall: () => {
    //       //   if (toast) toast({ text: "Please avoid rapid clicks" });
    //       // },
    //     });
    //   } else {
    //     updateURLParam("toggleFullScreen", value, mode);
    //   }
    // }, 100); // 100ms debounce
  }, [updateURLParam, nav, toast]);

  // When you want to update lyricsFullScreen, update the URL with debouncing
  const setLyricsFullScreen = useCallback((value) => {
    // Update state immediately for responsive UI
    setLyricsFullScreenState(value);
    
    // // Clear existing timer
    // if (lyricsFullScreenTimerRef.current) {
    //   clearTimeout(lyricsFullScreenTimerRef.current);
    // }
    
    // // Debounce URL update to prevent rapid changes
    // lyricsFullScreenTimerRef.current = setTimeout(() => {
    //   const mode = value ? "push" : "replace"; // open -> push, close -> replace
    //   if (nav && nav.updateQueryParamDebounced) {
    //     nav.updateQueryParamDebounced("lyricsFullScreen", value, mode, {
    //       // onStall: () => {
    //       //   if (toast) toast({ text: "Please avoid rapid clicks" });
    //       // },
    //     });
    //   } else {
    //     updateURLParam("lyricsFullScreen", value, mode);
    //   }
    // }, 100); // 100ms debounce
  }, [updateURLParam, nav, toast]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (toggleFullScreenTimerRef.current) {
        clearTimeout(toggleFullScreenTimerRef.current);
      }
      if (lyricsFullScreenTimerRef.current) {
        clearTimeout(lyricsFullScreenTimerRef.current);
      }
    };
  }, []);

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
