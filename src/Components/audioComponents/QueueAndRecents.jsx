// ===========================
// File: src/components/QueueAndRecentsSide.jsx
// A Spotify‑style "Add to playlist" popup (Enhanced)
// ===========================

"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLibrary } from "@/Contexts/libraryContext";
import { RiSearchLine, RiSearchEyeFill } from "react-icons/ri";
import { IoAddSharp } from "react-icons/io5";
import { FaRegCircle } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { FaArrowLeft } from "react-icons/fa6";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import NotFound from "../Helper/not-found";
import { usePlayer } from "@/Contexts/playerContext";
import SearchPlaylistSongCard from "../playlistCards/searchPlaylistSongCard";
import ListRender from "../Helper/listRender";
import QueueSongCard from "../playlistCards/queueSongCard";
import { useSession } from "next-auth/react";
import dateFormatter from "@/functions/dateFormatter";
/**********************
 * SERVER‑ACTION IMPORTS
 **********************/

export default function QueueAndRecentsSide({
  open,
  onClose,
  className,
  style,
}) {
  const { 
    currentSong, queue, context, 
    originalQueue, userInsertQueue, autoplayEnabled,
    addToQueue, playNext, clearUserInsertQueue, isShuffling
  } = usePlayer();
  const { data: session } = useSession();

  const [isPending, startTransition] = useTransition();
  const [changesMade, setChangesMade] = useState(false);
  const [recents, setRecents] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [expandedRecents, setExpandedRecents] = useState({});

  const popupRef = useRef(null);

  const router = useRouter();

  const [activeItem, setActiveItem] = useState(0);
  const [activeTabSongs, setActiveTabSongs] = useState(null);

  // Calculate remaining songs in queue (Spotify-like behavior)
  const getRemainingSongs = () => {
    if (!originalQueue || originalQueue.length === 0) return [];
    
    if (isShuffling) {
      // When shuffle is on, show all songs in shuffled order
      return originalQueue;
    } else {
      // When shuffle is off, show only remaining songs
      const currentIndex = originalQueue.findIndex(song => song._id === currentSong?._id);
      if (currentIndex === -1) return originalQueue;
      return originalQueue.slice(currentIndex + 1);
    }
  };

  const remainingSongs = getRemainingSongs();
  const allQueueSongs = [...userInsertQueue, ...remainingSongs];

  const handleclick = () => {
    if (context?.type === "Album") {
      router.push(`/albums/${context?.id}`);
    } else if (context?.type === "Artist") {
      router.push(`/artists/${context?.id}`);
    } else if (context?.type === "Playlist") {
      router.push(`/playlists/${context?.id}`);
    }
    // Do nothing for "Song"
  };

  // Load recents when recents tab is active
  useEffect(() => {
    if (activeItem === 1 && session) {
      fetch("/api/recents")
        .then(res => res.json())
        .then(data => setRecents(data.recents))
        .catch(err => console.error("Failed to load recents:", err));
    }
  }, [activeItem, session]);

  // Load recommendations when queue tab is active and autoplay is enabled
  useEffect(() => {
    if (activeItem === 0 && autoplayEnabled && currentSong) {
      const exclude = [
        ...originalQueue.map(s => s._id),
        ...userInsertQueue.map(s => s._id)
      ];
      const params = new URLSearchParams({
        seedSongId: currentSong._id,
        seedArtistId: currentSong.artist?._id || "",
        limit: "10"
      });
      exclude.forEach(id => params.append("exclude", id));
      
      fetch(`/api/recommendations?${params}`)
        .then(res => res.json())
        .then(data => setRecommendations(data.songs || []))
        .catch(err => console.error("Failed to load recommendations:", err));
    }
  }, [activeItem, autoplayEnabled, currentSong, originalQueue, userInsertQueue]);

  return (
    <>
      {open && (
        <motion.div
          ref={popupRef}
          initial={{ y: 300, opacity: 0 }}
          exit={{ y: -200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          //   className={`fixed z-[9999] bg-zinc-800 p-1 text-white rounded-md shadow-lg sm:w-[260px]    w-full transition-transform duration-1000    `}
          drag={window.innerWidth <= 640 ? "y" : false}
          dragConstraints={{ top: 0, bottom: 300 }}
          onDragEnd={(event, info) => {
            if (window.innerWidth <= 640 && info.offset.y > 100) {
              setTimeout(() => {
                onClose(); // ✅ call when dragged down enough
              }, 1000);
            }
          }}
          className={className}
          style={style}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className=" flex gap-5 p-3 items-center sticky top-0 bg-zinc-900">
            <FaArrowLeft className="text-lg sm:hidden" onClick={onClose} />
            <ListRender
              activeItem={activeItem}
              setActiveItem={setActiveItem}
              listItems={["Queue", "Recents"]}
              className="flex gap-2"
            />

            <IoAddSharp
              className="transform rotate-45 ml-auto hidden sm:block"
              size={25}
              onClick={onClose}
            />
          </div>

          <div className="h-auto  overflow-hidden">
            {activeItem === 0 && (
              <>
                {/* Queue Tab */}
                {allQueueSongs?.length === 0 && (
                  <NotFound
                    icon={
                      <lord-icon
                        src="https://cdn.lordicon.com/wjyqkiew.json"
                        trigger="loop"
                        delay="1000"
                        state="morph-cross"
                        colors="primary:#ffffff,secondary:#16c72e"
                        style={{ width: 150, height: 150 }}
                      ></lord-icon>
                    }
                    text={"Nothing Available"}
                    position={"center"}
                  />
                )}
                
                {/* Recommendations Section */}
                {autoplayEnabled && recommendations.length > 0 && (
                  <div className="flex flex-col p-3 w-full gap-5">
                    <p className="font-bold text-md text-gray-400">Recommended for you</p>
                    <div>
                      {recommendations.slice(0, 5).map((song, idx) => (
                        <QueueSongCard
                          key={song._id}
                          index={idx}
                          item={song}
                          context={context}
                          allSongs={recommendations}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeItem === 1 && (
              <>
                {/* Recents Tab */}
                {!session ? (
                  <div className="p-4 text-center text-gray-400">
                    Sign in to see your recently played
                  </div>
                ) : !recents ? (
                  <div className="p-4 text-center text-gray-400">
                    Loading...
                  </div>
                ) : (
                  <>
                    {/* Recent Songs */}
                    {recents.songs && recents.songs.length > 0 && (
                      <div className="flex flex-col p-3 w-full gap-5">
                        <p className="font-bold text-md">Recently played songs</p>
                        <div>
                          {recents.songs.slice(0, 10).map((item, idx) => (
                            <div 
                              key={item.song._id} 
                              className="flex items-center justify-between text-gray-400 h-[60px] p-1 hover:bg-white/8 rounded-[5px] group/songbar cursor-pointer"
                              onClick={() => {
                                if (item.song?.artist?._id) {
                                  router.push(`/artists/${item.song.artist._id}`);
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 relative">
                                  <img
                                    src={item.song.image || "/images/notfound.png"}
                                    alt={`song cover ${idx}`}
                                    className="min-w-10 min-h-10 rounded cursor-pointer"
                                  />
                                </div>
                                <div className="truncate max-w-full">
                                  <div className="font-semibold text-white max-w-full truncate">
                                    {item.song.name}
                                  </div>
                                  <div className="text-sm max-w-full truncate">
                                    <span className="hover:underline">
                                      {item.song.artist?.name || "Unknown Artist"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                                                           <div className="text-xs text-gray-500">
                               {dateFormatter(item.playedAt)}
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                                       {/* Recent Albums */}
                    {recents.albums && recents.albums.length > 0 && (
                      <div className="flex flex-col p-3 w-full gap-5">
                        <p className="font-bold text-md">Recently played albums</p>
                        <div>
                          {recents.albums.slice(0, 5).map((item, idx) => (
                            <div key={item.album._id}>
                              <div 
                                className="flex items-center justify-between text-gray-400 h-[60px] p-1 hover:bg-white/8 rounded-[5px] group/songbar cursor-pointer"
                                onClick={() => {
                                  if (item.album?._id) {
                                    router.push(`/albums/${item.album._id}`);
                                  }
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 relative">
                                    <img
                                      src={item.album.image || "/images/notfound.png"}
                                      alt={`album cover ${idx}`}
                                      className="min-w-10 min-h-10 rounded cursor-pointer"
                                    />
                                  </div>
                                  <div className="truncate max-w-full">
                                    <div className="font-semibold text-white max-w-full truncate">
                                      {item.album?.name || "Unknown Album"}
                                    </div>
                                    <div className="text-sm max-w-full truncate">
                                      <span className="hover:underline">
                                        {item.album.artist?.name || "Unknown Artist"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-xs text-gray-500">
                                    {dateFormatter(item.playedAt)}
                                  </div>
                                  {item.songs && item.songs.length > 0 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedRecents(prev => ({
                                          ...prev,
                                          [`album-${item.album._id}`]: !prev[`album-${item.album._id}`]
                                        }));
                                      }}
                                      className="text-gray-400 hover:text-white"
                                    >
                                      {expandedRecents[`album-${item.album._id}`] ? (
                                        <FaChevronUp className="text-sm" />
                                      ) : (
                                        <FaChevronDown className="text-sm" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {/* Expanded songs played from this album */}
                              {expandedRecents[`album-${item.album._id}`] && item.songs && item.songs.length > 0 && (
                                <div className="ml-4 mt-2 border-l border-gray-700 pl-4">
                                  {item.songs.slice(0, 5).map((songItem, songIdx) => (
                                    <QueueSongCard
                                      key={songItem.song._id}
                                      index={songIdx}
                                      item={songItem.song}
                                      context={{
                                        type: "Album",
                                        id: item.album._id,
                                        name: item.album.name,
                                      }}
                                      allSongs={item.songs.map(s => s.song)}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                     {/* Recent Playlists */}
                    {recents.playlists && recents.playlists.length > 0 && (
                      <div className="flex flex-col p-3 w-full gap-5">
                        <p className="font-bold text-md">Recently played playlists</p>
                        <div>
                          {recents.playlists.slice(0, 5).map((item, idx) => (
                            <div 
                              key={item.playlist._id} 
                              className="flex items-center justify-between text-gray-400 h-[60px] p-1 hover:bg-white/8 rounded-[5px] group/songbar cursor-pointer"
                              onClick={() => {
                                if (item.playlist?._id) {
                                  router.push(`/playlists/${item.playlist._id}`);
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 relative">
                                  <img
                                    src={item.playlist.image || "/images/notfound.png"}
                                    alt={`playlist cover ${idx}`}
                                    className="min-w-10 min-h-10 rounded cursor-pointer"
                                  />
                                </div>
                                <div className="truncate max-w-full">
                                  <div className="font-semibold text-white max-w-full truncate">
                                    {item.playlist.name}
                                  </div>
                                  <div className="text-sm max-w-full truncate text-gray-500">
                                    Playlist
                                  </div>
                                </div>
                              </div>
                                                             <div className="text-xs text-gray-500">
                                 {dateFormatter(item.playedAt)}
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Recent Artists */}
                    {recents.artists && recents.artists.length > 0 && (
                      <div className="flex flex-col p-3 w-full gap-5">
                        <p className="font-bold text-md">Recently played artists</p>
                        <div>
                          {recents.artists.slice(0, 5).map((item, idx) => (
                            <div 
                              key={item.artist._id} 
                              className="flex items-center justify-between text-gray-400 h-[60px] p-1 hover:bg-white/8 rounded-[5px] group/songbar cursor-pointer"
                              onClick={() => {
                                if (item.artist?._id) {
                                  router.push(`/artists/${item.artist._id}`);
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 relative">
                                  <img
                                    src={item.artist.image || "/images/notfound.png"}
                                    alt={`artist cover ${idx}`}
                                    className="min-w-10 min-h-10 rounded cursor-pointer"
                                  />
                                </div>
                                <div className="truncate max-w-full">
                                  <div className="font-semibold text-white max-w-full truncate">
                                    {item.artist?.name || "Unknown Artist"}
                                  </div>
                                  <div className="text-sm max-w-full truncate text-gray-500">
                                    Artist
                                  </div>
                                </div>
                              </div>
                                                             <div className="text-xs text-gray-500">
                                 {dateFormatter(item.playedAt)}
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}

                     {(!recents.songs || recents.songs.length === 0) && 
                     (!recents.albums || recents.albums.length === 0) && 
                     (!recents.playlists || recents.playlists.length === 0) && 
                     (!recents.artists || recents.artists.length === 0) && (
                      <NotFound
                        icon={
                          <lord-icon
                            src="https://cdn.lordicon.com/wjyqkiew.json"
                            trigger="loop"
                            delay="1000"
                            state="morph-cross"
                            colors="primary:#ffffff,secondary:#16c72e"
                            style={{ width: 150, height: 150 }}
                          ></lord-icon>
                        }
                        text={"No recent activity"}
                        position={"center"}
                      />
                    )}
                  </>
                )}
              </>
            )}
             {/* Queue Tab */}
            {activeItem == 0 && (
              <>
                <div className="flex flex-col p-3 w-full gap-5">
                  <p className="font-bold text-md ">{`Now Playing`}</p>
                  <div>
                    <QueueSongCard
                      index={0}
                      item={currentSong}
                      context={{
                        type: context.type,
                        id: context.id,
                        name: context.name,
                      }}
                      allSongs={queue}
                    />
                  </div>
                </div>
                
                {/* User Insert Queue */}
                {userInsertQueue.length > 0 && (
                  <div className="flex flex-col p-3 w-full gap-5">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-md">Next in queue</p>
                      <button
                        onClick={clearUserInsertQueue}
                        className="text-sm text-gray-400 hover:text-white"
                      >
                        Clear queue
                      </button>
                    </div>
                    <div>
                      {userInsertQueue.map((song, idx) => (
                        <QueueSongCard
                          key={song._id}
                          index={idx}
                          item={song}
                          context={{
                            type: "UserQueue",
                            id: "user-queue",
                            name: "Your queue",
                          }}
                          allSongs={userInsertQueue}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Remaining Songs from Original Queue */}
                {remainingSongs.length > 0 && (
                  <div className="flex flex-col p-3 w-full gap-5">
                    <p className="font-bold text-md ">
                      Next from :
                      <span
                        className="hover:underline pl-1 cursor-pointer"
                        onClick={handleclick}
                      >
                        {context?.name}
                      </span>
                    </p>
                    <div>
                      {remainingSongs.map((song, idx) => (
                        <QueueSongCard
                          key={song._id}
                          index={idx}
                          item={song}
                          context={{
                            type: context.type,
                            id: context.id,
                            name: context.name,
                          }}
                          allSongs={remainingSongs}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ))} */}
          </div>
        </motion.div>
      )}
    </>
  );
}
