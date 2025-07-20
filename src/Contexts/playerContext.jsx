// context/PlayerContext.js
import { createContext, useContext, useState } from "react";

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [context, setContext] = useState(null); // e.g. { type: 'playlist', id: '...' }

  const play = (songList, current, contextInfo) => {
    setQueue(songList);
    setCurrentSong(current);
    setContext(contextInfo);
  };

  return (
    <PlayerContext.Provider value={{ currentSong, queue, context, play }}>
      {children}
    </PlayerContext.Provider>
  );
};
