// context/PlayerContext.js
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";


const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  // ===================================================
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [context, setContext] = useState(null); // e.g. { type: 'playlist', id: '...' }

  // NEW: Enhanced queue state for Spotify-like behavior
  const [originalQueue, setOriginalQueue] = useState([]);
  const [playOrder, setPlayOrder] = useState([]);
  const [currentPlayOrderIndex, setCurrentPlayOrderIndex] = useState(0);
  const [userInsertQueue, setUserInsertQueue] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // "off", "all", "one"
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [positionSec, setPositionSec] = useState(0);

  // for opening purposes
    // for opening purposes
    const [openQueue, setOpenQueue] = useState(false)
    const [isPlaying , setIsPlaying ] = useState(false)
    const durationRef =useRef("");
    const currentTimeRef =useRef("");
    const audioRef = useRef()
  const { data: session } = useSession();

  //contexts to use

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

  // Enhanced play function with queue management
  const play = useCallback((songList, current, contextInfo) => {
    setOriginalQueue(songList);
    setQueue(songList); // Keep for backward compatibility
    setCurrentSong(current);
    setContext(contextInfo);
    
    // Find current song index in original queue
    const startIndex = songList.findIndex(song => song._id === current._id);
    const newPlayOrder = buildPlayOrder(songList.length, startIndex, isShuffling);
    setPlayOrder(newPlayOrder);
    setCurrentPlayOrderIndex(newPlayOrder.indexOf(startIndex));
    setUserInsertQueue([]);
    setPositionSec(0);
  }, [isShuffling, buildPlayOrder]);

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
    } else if (item?.type === "Playlist") {
      conditionCheck =
        item?.songs?.some(
          (songData) => songData.song?._id === currentSong?._id
        ) && item?.type == context?.type && item?._id == context?.id;
    }

    return conditionCheck;
  };

  // Next track logic with autoplay
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
      setUserInsertQueue(prev => prev.slice(1));
      setCurrentSong(nextSong);
      setPositionSec(0);
      return;
    }

    // Move to next in play order
    const nextIndex = currentPlayOrderIndex + 1;
    if (nextIndex >= playOrder.length) {
      if (repeatMode === "all") {
        // Wrap to beginning
        setCurrentPlayOrderIndex(0);
        setCurrentSong(originalQueue[playOrder[0]]);
        setPositionSec(0);
      } else {
        // End of queue - try autoplay
        if (autoplayEnabled && currentSong) {
          try {
            const exclude = [
              ...originalQueue.map(s => s._id),
              ...userInsertQueue.map(s => s._id)
            ];
            const params = new URLSearchParams({
              seedSongId: currentSong._id,
              seedArtistId: currentSong.artist._id,
              limit: "25"
            });
            exclude.forEach(id => params.append("exclude", id));
            
            const res = await fetch(`/api/recommendations?${params}`);
            const data = await res.json();
            
            if (data.songs && data.songs.length > 0) {
              setUserInsertQueue(data.songs);
              setCurrentSong(data.songs[0]);
              setPositionSec(0);
              // TODO: Show toast "Autoplaying similar songs"
            } else {
              setIsPlaying(false);
            }
          } catch (err) {
            console.error("Autoplay failed:", err);
            setIsPlaying(false);
          }
        } else {
          setIsPlaying(false);
        }
      }
      return;
    }

    // Play next song in order
    setCurrentPlayOrderIndex(nextIndex);
    setCurrentSong(originalQueue[playOrder[nextIndex]]);
    setPositionSec(0);
  }, [currentPlayOrderIndex, playOrder, originalQueue, userInsertQueue, repeatMode, autoplayEnabled, currentSong]);

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
        setPositionSec(0);
      } else {
        // Restart first track
        setCurrentPlayOrderIndex(0);
        setCurrentSong(originalQueue[playOrder[0]]);
        setPositionSec(0);
      }
      return;
    }

    setCurrentPlayOrderIndex(prevIndex);
    setCurrentSong(originalQueue[playOrder[prevIndex]]);
    setPositionSec(0);
  }, [currentPlayOrderIndex, playOrder, originalQueue, repeatMode]);

  // Queue management
  const addToQueue = useCallback((songs) => {
    setUserInsertQueue(prev => [...prev, ...songs]);
  }, []);

  const playNext = useCallback((songs) => {
    setUserInsertQueue(prev => [...songs, ...prev]);
  }, []);

  const clearUserInsertQueue = useCallback(() => {
    setUserInsertQueue([]);
  }, []);

  // Controls
  const toggleShuffle = useCallback(() => {
    const newShuffle = !isShuffling;
    setIsShuffling(newShuffle);
    
    if (originalQueue.length > 0) {
      const currentIndex = originalQueue.findIndex(song => song._id === currentSong._id);
      const newPlayOrder = buildPlayOrder(originalQueue.length, currentIndex, newShuffle);
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
      originalQueue: originalQueue.map(s => s._id),
      playOrder,
      currentPlayOrderIndex,
      userInsertQueue: userInsertQueue.map(s => s._id),
      isShuffling,
      repeatMode,
      autoplayEnabled,
      positionSec,
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem("spotify.playbackState", JSON.stringify(state));

    // Save to server if logged in
    if (session) {
      try {
        await fetch("/api/playback-state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state, updatedAt: state.updatedAt })
        });
      } catch (err) {
        console.error("Failed to persist playback state:", err);
      }
    }
  }, [currentSong, context, originalQueue, playOrder, currentPlayOrderIndex, userInsertQueue, isShuffling, repeatMode, autoplayEnabled, positionSec, session]);

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

      // Try server if logged in
      let serverData = null;
      if (session) {
        try {
          const res = await fetch("/api/playback-state");
          const data = await res.json();
          serverData = data.playbackState;
        } catch (err) {
          console.error("Failed to fetch server playback state:", err);
        }
      }

      // Prefer newer data
      const localTime = localData?.updatedAt ? new Date(localData.updatedAt).getTime() : 0;
      const serverTime = serverData?.updatedAt ? new Date(serverData.updatedAt).getTime() : 0;
      const finalData = serverTime > localTime ? serverData : localData;

      if (finalData) {
        // Populate songs from IDs if needed
        const populateSongs = async (songIds) => {
          if (!songIds || songIds.length === 0) return [];
          try {
            const res = await fetch(`/api/play/song/bulk`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ songIds })
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
        setPlayOrder(finalData.playOrder || []);
        setCurrentPlayOrderIndex(finalData.currentPlayOrderIndex || 0);
        setIsShuffling(finalData.isShuffling || false);
        setRepeatMode(finalData.repeatMode || "off");
        setAutoplayEnabled(finalData.autoplayEnabled !== false);
        setPositionSec(finalData.positionSec || 0);

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
          setQueue(songs); // Keep for backward compatibility
        }

        if (finalData.userInsertQueue && finalData.userInsertQueue.length > 0) {
          const songs = await populateSongs(finalData.userInsertQueue);
          setUserInsertQueue(songs);
        }
      }
    };

    hydrate();
  }, [session]);

  // Debounced persistence
  useEffect(() => {
    const timeoutId = setTimeout(persistPlaybackState, 300);
    return () => clearTimeout(timeoutId);
  }, [persistPlaybackState]);

  const handlePlayFromType = async (item) => {
    const conditionCheck = conditionCheckForSong(item);

    if (currentSong == null || conditionCheck == false) {
      try {
        const res = await fetch(`/api/play/${item?.type}/${item?._id}`);
        const data = await res.json();
        // for debug 
        console.log(data)
        play(data.songs, data.current, data.context);
        
        // Record recents
        if (session) {
          try {
            await fetch("/api/recents", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                entityType: data.context.type,
                entityId: data.context.id
              })
            });
          } catch (err) {
            console.error("Failed to record recents:", err);
          }
        }
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
        currentSong, queue, context, play, handlePlayFromType, conditionCheckForSong, 
        openQueue, setOpenQueue, isPlaying, setIsPlaying, durationRef, currentTimeRef, audioRef,
        // NEW
        originalQueue, playOrder, currentPlayOrderIndex, userInsertQueue,
        isShuffling, repeatMode, autoplayEnabled, positionSec,
        nextTrack, prevTrack, toggleShuffle, cycleRepeat, addToQueue, playNext, clearUserInsertQueue,
        setAutoplayEnabled
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
