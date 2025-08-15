"use client";
import React, { useEffect, useState, useContext, useRef } from "react";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { FaRegClock } from "react-icons/fa";
import { useParams } from "next/navigation";
import { useOtherContexts } from "@/Contexts/otherContexts";
import { usePlayer } from "@/Contexts/playerContext";
import MiddlePlaylistSongCard from "@/Components/playlistCards/middlePlaylistSongCard";
import NotFound from "@/Components/Helper/not-found";
import GENRES from "@/data/genres.json";
import ThreeDotsLoader from "@/Components/Helper/ThreeDotsLoader";
export default function GenrePage() {
  const params = useParams();
  const genreName = decodeURIComponent(params.name);
  const { middleWidth } = useOtherContexts();
  const { handlePlayFromType, conditionCheckForSong, isPlaying } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const genreInfo = GENRES.find((g) => g.name.toLowerCase() === genreName.toLowerCase());
  const headerColor = genreInfo?.color || "#283ea8";
  const item = { type: "Genre", _id: genreName, name: genreName };
  const conditionCheck = conditionCheckForSong(item);

  // column widths (resizable like playlist page)
  const [titleWidth, setTitleWidth] = useState(300);
  const [albumWidth, setAlbumWidth] = useState(300);
  const resizerRef = useRef(null);

  const startResizing = (e) => {
    const target = e.target.getAttribute("data-resizer-name");
    const startX = e.clientX;

    let subject = null;
    let setSubject = null;
    if (target === "title") {
      subject = titleWidth;
      setSubject = (value) => setTitleWidth(value);
    } else if (target === "album") {
      subject = albumWidth;
      setSubject = (value) => setAlbumWidth(value);
    }

    const startWidth = subject;

    const onMouseMove = (ev) => {
      const newWidth = startWidth + (ev.clientX - startX);
      setSubject(Math.max(newWidth, 100));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // header bg on scroll and sticky title bar behavior
  const [scrolled, setScrolled] = useState(false);
  const handleScroll = (e) => {
    setScrolled(e.target.scrollTop > 225);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/genres/${encodeURIComponent(genreName)}`)
      .then((r) => r.json())
      .then((data) => {
        setSongs(data.songs || []);
      })
      .finally(() => setLoading(false));
  }, [genreName]);

  if (loading) return <div className="w-full h-full flex justify-center items-center"><ThreeDotsLoader/></div>;

  return (
    <div
      className="scroll-container relative w-full h-full overflow-y-auto text-white bg-zinc-900 rounded-md"
      onScroll={handleScroll}
    >
      {/* Top banner */}
      <div
        className="p-5 pt-10 sm:pt-16 flex gap-4 items-end shadow-lg shadow-black/35"
        style={{ background: headerColor }}
      >
        <div className="flex flex-col gap-1">
          <p className="text-sm text-white/60">Genre</p>
          <h1 className={`${middleWidth < 640 ? "text-3xl" : "text-6xl"} font-extrabold`}>{genreName}</h1>
        </div>
        {songs.length > 0 && (
          <div
            className="ml-auto p-2.5 rounded-full bg-green-500 cursor-pointer"
            onClick={() => handlePlayFromType(item)}
          >
            {conditionCheck && isPlaying ? (
              <IoIosPause className="text-3xl text-black" />
            ) : (
              <IoIosPlay className="text-3xl text-black" />
            )}
          </div>
        )}
      </div>

      {/* Songs section with sticky toolbar and header */}
      <div
        className="text-white bg-gradient-to-b to-zinc-900"
        style={{ background: `linear-gradient(0deg,#19191b 80%, ${headerColor}80 )` }}
      >
        {(scrolled && songs.length > 0) && (
          <div
            className="sticky top-0 z-10 h-[60px] flex items-center justify-between py-3 px-5"
            style={{ background: scrolled ? headerColor || "#18181b" : "transparent" }}
          >
            <div
              className="p-2.5 rounded-full bg-green-500 cursor-pointer"
              onClick={() => handlePlayFromType(item)}
            >
              {conditionCheck && isPlaying ? (
                <IoIosPause className="text-3xl text-black" />
              ) : (
                <IoIosPlay className="text-3xl text-black" />
              )}
            </div>
            { (
              <p className="font-bold font-sans text-xl px-3 mr-auto max-w-full truncate">{genreName}</p>
            )}
            {/* Right-side spacer to balance layout like playlist page */}
            <div className="max-w-[200px]" />
          </div>
        )}

        {songs.length > 0 && (
          <div
            className={`group/titleHeader sticky top-[60px] z-10 px-3 h-10 flex items-center border-b-[0.5px] border-b-[#747474b2] text-sm font-medium text-gray-300 ${
              scrolled ? "bg-zinc-900 px-8" : "bg-transparent mx-5"
            }`}
          >
            <div className="w-[40px] truncate">#</div>
            <div style={{ width: `${titleWidth}px` }} className="truncate relative flex items-center">
              <span>Title</span>
              <div
                data-resizer-name="title"
                ref={resizerRef}
                onMouseDown={startResizing}
                className="hidden sm:block absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent group-hover/titleHeader:bg-white"
              ></div>
            </div>
            <div
              style={{ width: `${albumWidth}px` }}
              className={`truncate ${middleWidth >= 700 ? "block" : "hidden"} relative flex items-center`}
            >
              <span>Album</span>
              <div
                data-resizer-name="album"
                ref={resizerRef}
                onMouseDown={startResizing}
                className="hidden sm:block absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent group-hover/titleHeader:bg-white"
              ></div>
            </div>
            <div className="w-[150px] max-w-[100%] ml-auto truncate hidden sm:flex justify-center">
              <FaRegClock />
            </div>
          </div>
        )}

        {songs.length === 0 ? (
          <NotFound text="No songs in this genre" position="top" />
        ) : (
          songs.map((song, index) => (
            <div className="px-5" key={song._id}>
              <MiddlePlaylistSongCard
                index={index}
                item={song}
                showIndexes={true}
                context={{ type: "Genre", id: genreName, name: genreName }}
                allSongs={songs}
                titleWidth={titleWidth}
                albumWidth={albumWidth}
                wantAdded={false}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}


