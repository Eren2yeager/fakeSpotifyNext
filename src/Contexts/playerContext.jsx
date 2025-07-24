// context/PlayerContext.js
import { createContext, useContext, useState } from "react";
import { audioRefContext, isPlayingContext } from "./contexts";

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [context, setContext] = useState(null); // e.g. { type: 'playlist', id: '...' }
  //contexts to use
  const Context_audio_ref = useContext(audioRefContext);
  const Context_isPlaying = useContext(isPlayingContext);

  const play = (songList, current, contextInfo) => {
    setQueue(songList);
    setCurrentSong(current);
    setContext(contextInfo);
  };

  const handlePlayFromType = async (item) => {
    let conditionCheck = false;
    if (item.type === "Song") {
      conditionCheck =
        currentSong?._id === item._id && item.type == context.type;
    } else if (item.type === "Artist") {
      conditionCheck =
        currentSong?.artist?._id === item._id && item.type == context.type;
    } else if (item.type === "Album") {
      conditionCheck =
        currentSong?.album?._id === item._id && item.type == context.type;
    } else if (item.type === "Playlist") {
      conditionCheck =
        item.songs?.some(
          (songData) => songData.song?._id === currentSong?._id
        ) && item.type == context.type;
    }

    if (currentSong == null || conditionCheck == false) {
      try {
        const res = await fetch(`/api/play/${item.type}/${item._id}`);
        const data = await res.json();
        play(data.songs, data.current, data.context);
      } catch (err) {
        console.error("Failed to play:", err);
      }
    } else {
      if (conditionCheck && Context_isPlaying.isPlaying) {
        Context_audio_ref.current.pause();
        Context_isPlaying.setisPlaying(false);
      } else {
        Context_audio_ref.current.play();
        Context_isPlaying.setisPlaying(true);
      }
    }

    return conditionCheck
  };

  return (
    <PlayerContext.Provider value={{ currentSong, queue, context, play , handlePlayFromType }}>
      {children}
    </PlayerContext.Provider>
  );
};
