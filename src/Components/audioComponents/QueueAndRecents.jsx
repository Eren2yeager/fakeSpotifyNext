// ===========================
// File: src/components/QueueAndRecentsSide.jsx
// A Spotify‑style "Add to playlist" popup (Enhanced)
// ===========================

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoAddSharp } from "react-icons/io5";
import { HiOutlineQueueList } from "react-icons/hi2";
import NotFound from "../Helper/not-found";
import ListRender from "../Helper/listRender";
import QueueSongCard from "../playlistCards/queueSongCard";
import { usePlayer } from "@/Contexts/playerContext";
import { useSession } from "next-auth/react";
import dateFormatter from "@/functions/dateFormatter";
import { CiCircleChevDown } from "react-icons/ci";
import { CiCircleChevUp } from "react-icons/ci";

export default function QueueAndRecentsSide({ open, onClose, className, style }) {
  const {
    currentSong, context, originalQueue, userInsertQueue,
    clearUserInsertQueue, isShuffling, playOrder, currentPlayOrderIndex , autoplayEnabled, setAutoplayEnabled , originalQueueRelatedContext
  } = usePlayer();
  const { data: session } = useSession();
  const [activeItem, setActiveItem] = useState(0);
  const [recents, setRecents] = useState(null);
  const [expanded, setExpanded] = useState({});
  const popupRef = useRef(null);
  const router = useRouter();

  // Memoized remaining songs in queue
  const getRemainingSongs = useCallback(() => {
    if (!originalQueue?.length) return [];
    if (isShuffling) {
      if (!Array.isArray(playOrder) || !playOrder.length) return [];
      return playOrder.slice(currentPlayOrderIndex + 1).map(idx => originalQueue[idx]);
    }
    return currentPlayOrderIndex === -1 ? originalQueue : originalQueue.slice(currentPlayOrderIndex + 1);
  }, [isShuffling, originalQueue, playOrder, currentPlayOrderIndex , context]);
  const remainingSongs = getRemainingSongs();
  // Autoplay banner when we're consuming recommendations (flag only)
  const isInAutoplay = !!autoplayEnabled;

  // Recents fetch
  useEffect(() => {
    if (activeItem === 1 && session) {
      fetch("/api/recents")
        .then(res => res.json())
        .then(data => setRecents(data.recents))
        .catch(() => {});
    }
  }, [activeItem, session ,currentSong , context]);

  // Flatten and sort recents using the new type from backend ("Song", "Artist", "Album", "Playlist")
  function flatRecents(recents) {
    if (!recents) return [];
    let merged = [];
    // Map backend keys to type
    const typeMap = {
      songs: "Song",
      playlists: "Playlist",
      albums: "Album",
      artists: "Artist"
    };
    Object.entries(typeMap).forEach(([key, type]) => {
      recents[key]?.forEach(item => merged.push({ ...item, _type: type, playedAt: new Date(item.playedAt) }));
    });
    return merged.sort((a, b) => b.playedAt - a.playedAt);
  }
  const recentsList = flatRecents(recents);

  // Helper: Recents Card for Playlist/Album/Artist
  function RecentsGroupCard({ item, type, idx }) {
    // type is now "Playlist", "Album", "Artist"
    const typeKey = type.toLowerCase(); // "playlist", "album", "artist"
    const obj = item[typeKey];
    const id = obj?._id;
    const name = obj?.name || "Unknown";
    const image = obj?.image || "/images/notfound.png";
    const songsPlayed = item.songs?.length || 0;
    const expandKey = `${type}-${id}`;
    return (
      <div key={id} className="w-full">
                             <div className="flex px-3 pt-1 w-full font-sans font-semibold  text-sm">
                 {dateFormatter(item.playedAt)}
              </div>
        <div
          className="flex items-center justify-between text-gray-400 h-[60px] px-2 hover:bg-white/8 rounded-[5px] cursor-pointer"
          style={{ minWidth: 0, overflow: "hidden" }}
          onClick={() => {
            if (id) router.push(`/${typeKey}s/${id}`);
          }}
        >
          <div className="flex items-center gap-3 min-w-0" style={{ minWidth: 0, overflow: "hidden" }}>
            <div className="w-10 h-10 flex-shrink-0 overflow-hidden rounded" style={{ minWidth: 40, minHeight: 40 }}>
              <img
                src={image}
                alt={`${type} cover ${idx}`}
                className={`w-10 h-10 object-cover ${type === "Artist" ? "rounded-full" : "rounded"}`}
                style={{ minWidth: 40, minHeight: 40, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            <div className="truncate min-w-0" style={{ minWidth: 0 }}>
              <div className="font-semibold text-white truncate">{name}</div>
              <div className="text-xs text-gray-400 truncate">
                {songsPlayed} song{songsPlayed !== 1 ? "s" : ""} played
              </div>
            </div>
          </div>
          {songsPlayed > 0 && (
            <button
              onClick={e => {
                e.stopPropagation();
                setExpanded(prev => ({ ...prev, [expandKey]: !prev[expandKey] }));
              }}
              className=" flex items-center justify-center w-7 h-7 rounded-full bg-white/8  transition"
              tabIndex={-1}
            >
              {expanded[expandKey] ? <FaChevronUp className="text-white text-sm" /> : <FaChevronDown className="text-white text-sm" />}
            </button>
          )}
        </div>
        {expanded[expandKey] && item.songs?.length > 0 && (
          <div className="ml-4 mt-2 border-l border-white/45 pl-4 flex flex-col gap-1 overflow-hidden rounded-[5px]">
            {item.songs
              .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
              .map((songItem, songIdx) => (

                <div key={songIdx}>
                                     <div className="flex px-3 pt-1 w-full font-sans font-semibold  text-sm">
                 {dateFormatter(songItem.playedAt)}
              </div>
                <QueueSongCard
                  key={songItem.song._id}
                  index={songIdx}
                  item={songItem.song}
                  context={{
                    type,
                    name,
                    id,
                  }}
                  allSongs={[songItem.song]}
                  />
                  </div>
              ))}
          </div>
        )}
      </div>
    );
  }

  // Helper: Recents Song Card
  function RecentsSongCard({ item, idx }) {
    // item._type === "Song"
    const song = item.song;
    return (
      <>
                     <div className="flex px-3 pt-1 w-full font-sans font-semibold  text-sm">
                 {dateFormatter(item.playedAt)}
              </div>
      <QueueSongCard
        key={song._id}
        index={idx}
        item={song}
        context={{ type: "Song", name:song.name, id: song._id }}
        allSongs={[song]}
        />
        </>
    );
  }

  // Handler for context click
  const handleContextClick = () => {
    if (originalQueueRelatedContext?.type && originalQueueRelatedContext?.id) {
      router.push(`/${originalQueueRelatedContext.type.toLowerCase()}s/${contoriginalQueueRelatedContextext.id}`);
    }
  };

  return open && (
    <motion.div
      ref={popupRef}
      initial={{ y: 300, opacity: 0 }}
      exit={{ y: -200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      drag={window.innerWidth <= 640 ? "y" : false}
      dragConstraints={{ top: 0, bottom: 300 }}
      onDragEnd={(e, info) => {
        if (window.innerWidth <= 640 && info.offset.y > 100) setTimeout(onClose, 1000);
      }}
      className={className}
      style={style}
      onClick={e => e.stopPropagation()}
      onDoubleClick={e => e.stopPropagation()}
    >
      <div className="flex gap-5 p-3 items-center sticky top-0 bg-zinc-900 z-100">
        <FaArrowLeft className="text-lg sm:hidden" onClick={onClose} />
        <ListRender
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          listItems={["Queue", "Recents"]}
          className="flex gap-2"
        />
        <IoAddSharp className="transform rotate-45 ml-auto hidden sm:block" size={25} onClick={onClose} />
      </div>
      <div className="w-full h-auto overflow-hidden">
        {activeItem === 0 ? (
          <>
            {!currentSong ? (
              <NotFound
                icon={<HiOutlineQueueList size={40} />}
                buttonText="Find Something to Play"
                buttonOnClick={() => router.push("/search")}
                buttonColor="white"
                text="Add to Your Queue"
                position="center"
              />
            ) : (
              <>
                {isInAutoplay && (
                  <div className="flex p-3 w-full gap-5 text-sm">
                    Playing Recommended Songs
                  </div>
                )}

                {currentSong && (
                  <div className="flex flex-col p-3 w-full gap-5">
                    <p className="font-bold text-md">Now Playing</p>
                      <QueueSongCard
                      index={0}
                      item={currentSong}
                      context={{
                        type: context?.type,
                        id: context?.id,
                        name: context?.name,
                      }}
                        allSongs={originalQueue}
                    />
                  </div>
                )}
                {userInsertQueue.length > 0 && (
                  <div className="flex flex-col p-3 w-full ">
                    <div className="flex justify-between items-center pb-3">
                      <p className="font-bold text-md">Next in queue</p>
                      <button
                        onClick={clearUserInsertQueue}
                        className="text-sm text-gray-400 hover:text-white"
                      >
                        Clear queue
                      </button>
                    </div>
                    {userInsertQueue.map((song, idx) => (
                      <QueueSongCard
                        key={idx}
                        index={idx}
                        item={song}
                        context={{ type: "Queue", id: song._id, name: song.name }}
                        allSongs={userInsertQueue}
                        isFromUserInsertedQueue
                      />
                    ))}
                  </div>
                )}
                {remainingSongs.length > 0 && (
                  <div className="flex flex-col p-3 w-full">
                    <p className="font-bold text-md">
                      Next from :
                      <span className="hover:underline pl-1 cursor-pointer pb-3" onClick={handleContextClick}>
                        {originalQueueRelatedContext?.name}
                      </span>
                    </p>
                    {remainingSongs.map((song, idx) => (
                      <QueueSongCard
                        key={idx}
                        index={idx}
                        item={song}
                        context={originalQueueRelatedContext}
                        allSongs={remainingSongs}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {!session ? (
              <div className="p-4 text-center text-gray-400">Sign in to see your recently played</div>
            ) : !recents ? (
              <div className="p-4 text-center text-gray-400">Loading...</div>
            ) : recentsList.length > 0 ? (
              <div className="flex flex-col gap-2 mb-2 p-3">
                {recentsList.map((item, idx) => {
                  if (item._type === "Song") return <RecentsSongCard key={idx} item={item} idx={idx} />;
                  if (["Album", "Playlist", "Artist"].includes(item._type))
                    return <RecentsGroupCard key={idx} item={item} type={item._type} idx={idx} />;
                  return null;
                })}
              </div>
            ) : (
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
                text="No recent activity"
                position="center"
              />
            )}
          </>
        )}
      </div>
      
    </motion.div>
  );
}
