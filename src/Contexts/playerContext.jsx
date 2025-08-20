"use client";
// context/PlayerContext.js
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { useSpotifyToast } from "./SpotifyToastContext";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  // for uses
  const toast = useSpotifyToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // ===================================================
  const [currentSong, setCurrentSong] = useState(null);
  // Removed deprecated duplicate queue; rely on originalQueue everywhere
  const [context, setContext] = useState(null); // e.g. { type: 'playlist', id: '...' ,name:'...' }

  // NEW: Enhanced queue state for Spotify-like behavior
  const [originalQueue, setOriginalQueue] = useState([]);
  const [playOrder, setPlayOrder] = useState([]);
  const [currentPlayOrderIndex, setCurrentPlayOrderIndex] = useState(0);
  const [userInsertQueue, setUserInsertQueue] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // "off", "all", "one"
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  // Removed positionSec in favor of currentTimeRef (ref only)

  // for opening purposes
  const [isPlaying, setIsPlaying] = useState(false);
  const durationRef = useRef("");
  const currentTimeRef = useRef("");
  const audioRef = useRef();
  // openQueue state is synced with the "openQueue" query param in the URL
  // const [openQueue, updateOpenQueue] = useState(false);

  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const params = new URLSearchParams(window.location.search);
  //     const openQueueQuery = params.get("openQueue");
  //     updateOpenQueue(openQueueQuery === "true");
  //   }
  // }, [searchParams]); // re-run when router changes (URL changes)

  // When you want to update openQueue, update the URL (which will update state via useEffect)
  // Add an AbortController to prevent rapid route changes from repeated button clicks
  // let setOpenQueueAbortController = null;
  const setOpenQueue = (value) => {
    // if (typeof window !== "undefined") {
    //   // Abort any previous navigation if still pending
    //   if (setOpenQueueAbortController) {
    //     setOpenQueueAbortController.abort();
    //   }
    //   setOpenQueueAbortController = new AbortController();

    //   const params = new URLSearchParams(window.location.search);
    //   params.set("openQueue", value ? "true" : "false");
    //   const newUrl =
    //     window.location.pathname +
    //     (params.toString() ? `?${params.toString()}` : "");
    //   // router.push supports signal in Next.js 14+; fallback if not supported
    //   try {
    //     router.replace(newUrl, { scroll: false, signal: setOpenQueueAbortController.signal });
    //   } catch (e) {
    //     // If signal not supported, fallback to normal push
    //     router.replace(newUrl, { scroll: false });
    //   }
      updateOpenQueue(value);
    // }
  };

  // for checks
  const [isUserInsertedQueuePlaying, setIsUserInsertedQueuePlaying] =
    useState(false);
  const [originalQueueRelatedContext, setOriginalQueueRelatedContext] =
    useState();
  // Helper: build play order with or without shuffle
  const buildPlayOrder = useCallback((queueLength, startIndex, shuffle) => {
    const indices = Array.from({ length: queueLength }, (_, i) => i);
    if (!shuffle) return indices;
    // Keep current song fixed, shuffle the rest
    const before = indices.slice(0, startIndex);
    const after = indices.slice(startIndex + 1);
    // Fisher-Yates shuffle for the after part
    for (let i = after.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [after[i], after[j]] = [after[j], after[i]];
    }
    return [...before, indices[startIndex], ...after];
  }, []);

  // Function to play a specific song from userInsertQueue
  const playFromUserInsertQueue = (songId) => {
    if (!songId) return;
    setUserInsertQueue((prev) =>
      prev.filter((id) => id.toString() !== songId.toString())
    );
    setIsUserInsertedQueuePlaying(true);
    setCurrentSong(songId);

    setIsPlaying(true);
  };
  // Enhanced play function with queue management
  const play = useCallback(
    (songList, current, contextInfo) => {
      if (contextInfo.type === "Queue") {
        if (typeof current === "object" && current._id) {
          // userInsertQueue contains song objects, not just IDs? Let's check type
          setUserInsertQueue((prev) =>
            prev.filter((item) => {
              // If prev contains objects
              if (typeof item === "object" && item._id) {
                return item._id.toString() !== current._id.toString();
              }
              // If prev contains IDs
              return item.toString() !== current._id.toString();
            })
          );
          setIsUserInsertedQueuePlaying(true);
          setCurrentSong(current);
          setContext({ type: "Queue", name: current.name, id: current._id });

          setIsPlaying(true);
          return;
        } else {
          // fallback for ID
          playFromUserInsertQueue(current);
          setIsPlaying(true);
          return;
        }
      }

      setOriginalQueue(songList);
      setCurrentSong(current);
      setContext(contextInfo);
      setOriginalQueueRelatedContext(contextInfo);

      // Find current song index in original queue
      const startIndex = songList.findIndex((song) => song._id === current._id);
      const newPlayOrder = buildPlayOrder(
        songList.length,
        startIndex,
        isShuffling
      );
      setPlayOrder(newPlayOrder);
      setCurrentPlayOrderIndex(newPlayOrder.indexOf(startIndex));
      setUserInsertQueue([]);

      setIsPlaying(true);
      setAutoplayEnabled(false);
    },
    [isShuffling, buildPlayOrder]
  );

  const conditionCheckForSong = (item) => {
    let conditionCheck = false;
    if (item?.type === "Song") {
      conditionCheck =
        currentSong?._id === item?._id && item?.type == context?.type;
    } else if (item?.type === "Artist") {
      conditionCheck =
        currentSong?.artist?._id === item?._id && item?.type == context?.type;
    } else if (item?.type === "Album") {
      conditionCheck =
        currentSong?.album?._id === item?._id && item?.type == context?.type;
    } else if (item?.type === "Genre") {
      const genreId = (item?.name || item?._id || "").toString().toLowerCase();
      conditionCheck =
        Array.isArray(currentSong?.genres) &&
        currentSong.genres.some((g) => String(g).toLowerCase() === genreId) &&
        item?.type == context?.type &&
        String(context?.id || "").toLowerCase() === genreId;
    } else if (item?.type === "Playlist") {
      conditionCheck = item?.type == context?.type && item?._id == context?.id;
    }
    return conditionCheck;
  };

  // Next track logic with autoplay and recommendations
  const nextTrack = useCallback(async () => {
    if (repeatMode === "one") {
      // Restart current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    // Check user insert queue first
    if (userInsertQueue.length > 0) {
      const nextSong = userInsertQueue[0];
      // If the userInsertQueue contains song objects, not just IDs
      if (typeof nextSong === "object" && nextSong._id) {
        setUserInsertQueue((prev) => prev.slice(1));
        setIsUserInsertedQueuePlaying(true);
        setCurrentSong(nextSong);
        setContext({ type: "Queue", name: nextSong.name, id: nextSong._id });

        setIsPlaying(true);
        return;
      } else {
        // fallback for ID
        playFromUserInsertQueue(nextSong);
        setIsPlaying(true);
        return;
      }
    }

    let recommendController = null;
    // Move to next in play order
    const nextIndex = currentPlayOrderIndex + 1;
    if (nextIndex >= playOrder.length) {
      if (repeatMode === "all") {
        // Wrap to beginning
        setCurrentPlayOrderIndex(0);
        setCurrentSong(originalQueue[playOrder[0]]);

        setIsPlaying(true);
        setAutoplayEnabled(false);
      } else {
        // End of queue - try recommendations only now
        if (currentSong) {
          try {
            // Build exclude list of song IDs
            const exclude = [
              ...originalQueue.map((s) => s._id),
              ...userInsertQueue.map((s) =>
                typeof s === "object" ? s._id : s
              ),
            ];
            const params = new URLSearchParams({
              seedSongId: currentSong._id,
              seedArtistId: currentSong.artist?._id || "",
              seedAlbumId: currentSong.album?._id || "",
              seedPlaylistId:
                originalQueueRelatedContext?.type === "Playlist"
                  ? originalQueueRelatedContext?.id || ""
                  : "",
              limit: "50",
            });
            // Add exclude as query param (repeat for each)
            exclude.forEach((id) => params.append("exclude", id));

            // ✅ abort previous request if still running
            if (recommendController) recommendController.abort();
            recommendController = new AbortController();

            // Call your recommendations route
            const res = await fetch(`/api/recommendations?${params}`);
            const data = await res.json();
            if (data.songs && data.songs.length > 0) {
              // Play the first recommended song immediately
              setUserInsertQueue([]); // clear any old user queue
              setCurrentSong(data.songs[0]);

              setIsPlaying(true);
              // Optionally, add the rest to userInsertQueue if more than 1
              if (data.songs.length > 1) {
                setUserInsertQueue(data.songs.slice(1));
              }
              setAutoplayEnabled(true);
              toast({ text: "Autoplaying Similar Songs" });
            } else {
              // No recommendations, just stop
              toast({ text: "We can't find similar songs" });
              setIsPlaying(false);
              setAutoplayEnabled(false);
            }
          } catch (err) {
            console.error("Autoplay/Recommendation failed:", err);
            toast({ text: `Autoplay/Recommendation failed: ${err}` });
            setIsPlaying(false);
            setAutoplayEnabled(false);
          }
        } else {
          toast({ text: "We can't find similar songs" });
          setIsPlaying(false);
          setAutoplayEnabled(false);
        }
      }
      return;
    }

    // Play next song in order
    setCurrentPlayOrderIndex(nextIndex);
    setCurrentSong(originalQueue[playOrder[nextIndex]]);
    if (originalQueueRelatedContext) {
      setContext(originalQueueRelatedContext);
    }

    setIsPlaying(true);
  }, [
    currentPlayOrderIndex,
    playOrder,
    originalQueue,
    userInsertQueue,
    repeatMode,
    autoplayEnabled,
    currentSong,
  ]);

  // Previous track logic
  const prevTrack = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      // If more than 3 seconds in, restart current track
      audioRef.current.currentTime = 0;
      return;
    }

    const prevIndex = currentPlayOrderIndex - 1;
    if (prevIndex < 0) {
      if (repeatMode === "all") {
        // Wrap to end
        const lastIndex = playOrder.length - 1;
        setCurrentPlayOrderIndex(lastIndex);
        setCurrentSong(originalQueue[playOrder[lastIndex]]);
      } else {
        // Restart first track
        setCurrentPlayOrderIndex(0);
        setCurrentSong(originalQueue[playOrder[0]]);
      }
      return;
    }

    setCurrentPlayOrderIndex(prevIndex);
    setCurrentSong(originalQueue[playOrder[prevIndex]]);
  }, [currentPlayOrderIndex, playOrder, originalQueue, repeatMode]);

  // Queue management
  const addToQueue = useCallback((songs) => {
    setUserInsertQueue((prev) => [...prev, ...songs]);
    setAutoplayEnabled(false);
  }, []);

  const playNext = useCallback((songs) => {
    setUserInsertQueue((prev) => [...songs, ...prev]);
    setAutoplayEnabled(false);
  }, []);

  const clearUserInsertQueue = useCallback(() => {
    setUserInsertQueue([]);
    // Do not toggle autoplay here; it will be set at end-of-queue when needed
  }, []);

  // Controls
  const toggleShuffle = useCallback(() => {
    const newShuffle = !isShuffling;
    setIsShuffling(newShuffle);

    if (originalQueue.length > 0) {
      const currentIndex = originalQueue.findIndex(
        (song) => song._id === currentSong._id
      );
      const newPlayOrder = buildPlayOrder(
        originalQueue.length,
        currentIndex,
        newShuffle
      );
      setPlayOrder(newPlayOrder);
      setCurrentPlayOrderIndex(newPlayOrder.indexOf(currentIndex));
    }
  }, [isShuffling, originalQueue, currentSong, buildPlayOrder]);

  const cycleRepeat = useCallback(() => {
    const modes = ["off", "all", "one"];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  }, [repeatMode]);

  // Persistence
  const persistPlaybackState = useCallback(async () => {
    if (!currentSong) return;

    const state = {
      currentSong: currentSong._id,
      context,
      originalQueue: originalQueue.map((s) => s._id),
      originalQueueRelatedContext,
      playOrder,
      currentPlayOrderIndex,
      userInsertQueue: userInsertQueue.map((s) =>
        typeof s === "object" ? s._id : s
      ),
      isShuffling,
      repeatMode,
      autoplayEnabled,
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem("spotify.playbackState", JSON.stringify(state));

    // // Save to server if logged in
    // if (session) {
    //   try {
    //     await fetch("/api/playback-state", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({ state, updatedAt: state.updatedAt })
    //     });
    //   } catch (err) {
    //     console.error("Failed to persist playback state:", err);
    //   }
    // }
  }, [
    currentSong,
    context,
    originalQueueRelatedContext,
    originalQueue,
    playOrder,
    currentPlayOrderIndex,
    userInsertQueue,
    isShuffling,
    repeatMode,
    autoplayEnabled,
    session,
  ]);

  // Hydrate playback state on mount
  useEffect(() => {
    const hydrate = async () => {
      // Try localStorage first
      const localState = localStorage.getItem("spotify.playbackState");
      let localData = null;
      if (localState) {
        try {
          localData = JSON.parse(localState);
        } catch (err) {
          console.error("Failed to parse local playback state:", err);
        }
      }

      // // Try server if logged in
      // let serverData = null;
      // if (session) {
      //   try {
      //     const res = await fetch("/api/playback-state");
      //     const data = await res.json();
      //     serverData = data.playbackState;
      //   } catch (err) {
      //     console.error("Failed to fetch server playback state:", err);
      //   }
      // }

      // // Prefer newer data
      // const localTime = localData?.updatedAt ? new Date(localData.updatedAt).getTime() : 0;
      // const serverTime = serverData?.updatedAt ? new Date(serverData.updatedAt).getTime() : 0;
      // const finalData = serverTime > localTime ? serverData : localData;
      const finalData = localData;
      if (finalData) {
        // Populate songs from IDs if needed
        const populateSongs = async (songIds) => {
          if (!songIds || songIds.length === 0) return [];
          try {
            const res = await fetch(`/api/play/song/bulk`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ songIds }),
            });
            const data = await res.json();
            return data.songs || [];
          } catch (err) {
            console.error("Failed to populate songs:", err);
            return [];
          }
        };

        // Restore basic state first
        setContext(finalData.context);
        setOriginalQueueRelatedContext(finalData.originalQueueRelatedContext);
        setPlayOrder(finalData.playOrder || []);
        setCurrentPlayOrderIndex(finalData.currentPlayOrderIndex || 0);
        setIsShuffling(finalData.isShuffling || false);
        setRepeatMode(finalData.repeatMode || "off");
        setAutoplayEnabled(finalData.autoplayEnabled !== false);

        // Populate song data
        if (finalData.currentSong) {
          const songs = await populateSongs([finalData.currentSong]);
          if (songs.length > 0) {
            setCurrentSong(songs[0]);
          }
        }

        if (finalData.originalQueue && finalData.originalQueue.length > 0) {
          const songs = await populateSongs(finalData.originalQueue);
          setOriginalQueue(songs);
        }

        if (finalData.userInsertQueue && finalData.userInsertQueue.length > 0) {
          const songs = await populateSongs(finalData.userInsertQueue);
          setUserInsertQueue(songs);
        }
      }
    };

    hydrate();
  }, [session]);

  // Debounced persistence (exclude positionSec to avoid frequent writes)
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        if (session && pathname !== "/login") persistPlaybackState();
      },

      300
    );
    return () => clearTimeout(timeoutId);
  }, [
    currentSong,
    context,
    originalQueueRelatedContext,
    originalQueue,
    playOrder,
    currentPlayOrderIndex,
    userInsertQueue,
    isShuffling,
    repeatMode,
    autoplayEnabled,
  ]);

  // Persist on tab/window close to reduce restart-to-0 issues
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        const state = {
          currentSong: currentSong?._id,
          context,
          originalQueue: originalQueue.map((s) => s._id),
          originalQueueRelatedContext,
          playOrder,
          currentPlayOrderIndex,
          userInsertQueue: userInsertQueue.map((s) =>
            typeof s === "object" ? s._id : s
          ),
          isShuffling,
          repeatMode,
          autoplayEnabled,
          // No position persistence (using currentTimeRef only during session)
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("spotify.playbackState", JSON.stringify(state));
      } catch {}
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    currentSong,
    context,
    originalQueue,
    originalQueueRelatedContext,
    playOrder,
    currentPlayOrderIndex,
    userInsertQueue,
    isShuffling,
    repeatMode,
    autoplayEnabled,
  ]);

  // When user changes context, disable autoplay
  const handlePlayFromType = async (item) => {
    const conditionCheck = conditionCheckForSong(item);

    if (currentSong == null || conditionCheck == false) {
      try {
        const res = await fetch(`/api/play/${item?.type}/${item?._id}`);
        const data = await res.json();

        play(data.songs, data.current, data.context);
      } catch (err) {
        console.error("Failed to play:", err);
      }
    } else {
      if (conditionCheck && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };
  // ===================================================

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        context,
        play,
        handlePlayFromType,
        conditionCheckForSong,
        openQueue,
        setOpenQueue,
        isPlaying,
        setIsPlaying,
        durationRef,
        currentTimeRef,
        audioRef,
        // NEW
        originalQueue,
        playOrder,
        currentPlayOrderIndex,
        userInsertQueue,
        setUserInsertQueue,
        isShuffling,
        repeatMode,
        autoplayEnabled,
        nextTrack,
        prevTrack,
        toggleShuffle,
        cycleRepeat,
        addToQueue,
        playNext,
        clearUserInsertQueue,
        setAutoplayEnabled,
        playFromUserInsertQueue,
        originalQueueRelatedContext,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
