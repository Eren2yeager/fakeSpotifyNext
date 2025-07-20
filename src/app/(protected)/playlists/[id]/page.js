"use client";
import React, { useState, useRef, useContext, useEffect } from "react";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import { playlists, imagePreviewContext ,middleWidthContex} from "@/Contexts/contexts";
import { useParams } from "next/navigation";
import { FaRegClock } from "react-icons/fa";
import { IoAddOutline } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa6";

import { RiSearchLine } from "react-icons/ri";
import { usePlayer } from "@/Contexts/playerContext";
import { audioRefContext, isPlayingContext } from "@/Contexts/contexts";
import MiddlePlaylistSongCard from "@/Components/playlistCards/middlePlaylistSongCard";
import SuggestBgColor from "@/functions/bgSuggester";
import { useRouter } from "next/navigation";
import EditPlaylistModal from "@/Components/playlistCards/updatePlaylistModel";
import { PiNotePencil } from "react-icons/pi";


const MiddlePlaylistView = () => {
  const router = useRouter();

  const playlistsArrayContext = useContext(playlists);
  const ContextSelectedImage = useContext(imagePreviewContext);
  const Context_isPlaying = useContext(isPlayingContext);
  const Context_audio_ref = useContext(audioRefContext);
  const Context_middle_width = useContext(middleWidthContex);
  const {middleWidth} = Context_middle_width;

  // for search
  const [showInput, setShowInput] = useState(false);
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef(false);

  const params = useParams();
  const slug = params.id;

  const [bgColor, setBgColor] = useState(null);
  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    fetch(`/api/playlists/${slug}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch playlist");
        }
        return res.json();
      })
      .then((data) => {
        setPlaylist(data);
        const setBG = async () => {
          if (!data?.image) return;

          try {
            const color = await SuggestBgColor(data.image);
            setBgColor(color); // or color.rgb
            console.log("bg :" , color)
          } catch (err) {
            console.error("Error getting average color:", err);
          }
        };

        setBG();
      })
      .catch((err) => {
        console.error("❌ Error fetching playlists:", err);
      });

  }, [slug, playlistsArrayContext]);

  const handleIconClick = () => {
    setShowInput(true);
    setTimeout(() => {
      inputRef.current?.focus(); // Focus after rendering
    }, 0);
  };

  const handleBlur = () => {
    if (searchText.trim() === "") {
      setShowInput(false);
    }
  };

  // for resizing
  const [titleWidth, setTitleWidth] = useState(300); // Initial px width
  const [albumWidth, setAlbumWidth] = useState(300); // Initial px width
  const [dateAddedWidth, setDateAddedWidth] = useState(150); // Initial px width
  const resizerRef = useRef(null);

  const startResizing = (e) => {
    const target = e.target.getAttribute("data-resizer-name");

    const startX = e.clientX;

    let subject = null;
    let setSubject = null;
    if (target == "title") {
      subject = titleWidth;
      setSubject = (value) => {
        setTitleWidth(value);
      };
    } else if (target == "album") {
      subject = albumWidth;
      setSubject = (value) => {
        setAlbumWidth(value);
      };
    } else {
      subject = dateAddedWidth;
      setSubject = (value) => {
        setDateAddedWidth(value);
      };
    }
    let startWidth = subject;

    const onMouseMove = (e) => {
      const newWidth = startWidth + (e.clientX - startX);
      setSubject(Math.max(newWidth, 100)); // minimum 100px
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
  // for header bg on scroll
  const [scrolled, setScrolled] = useState(false);
  const handleScroll = (e) => {
    setScrolled(e.target.scrollTop > 225);
  };

  // for hovering show playbutton

  // to play the song from playlist or just a song
  const { play, currentSong, context } = usePlayer();

  let conditionCheck = false;
  if (playlist?.type === "Song") {
    conditionCheck =
      currentSong?._id === playlist?._id && playlist?.type == context.type;
  } else if (playlist?.type === "Artist") {
    conditionCheck =
      currentSong?.artist?._id === playlist?._id &&
      playlist?.type == context.type;
  } else if (playlist?.type === "Album") {
    conditionCheck =
      currentSong?.album?._id === playlist?._id &&
      playlist?.type == context.type;
  } else if (playlist?.type === "Playlist") {
    conditionCheck =
      playlist?.songs?.some(
        (songData) => songData.song?._id === currentSong?._id
      ) && playlist?.type == context.type;
  }
  const handlePlayFromType = async (type, id) => {
    if (currentSong == null || conditionCheck == false) {
      try {
        const res = await fetch(`http://localhost:5000/api/play/${type}/${id}`);
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
  };

  //   for edit play
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      className={`scroll-container  relative w-[100%] h-[100%] rounded-xl  overflow-y-auto text-white bg-zinc-900`}
      onScroll={handleScroll}
    >
      {isModalOpen && playlist?.type !== "Liked" && (
        <EditPlaylistModal
          playlist={playlist}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <div className=" w-[100%]   rounded-xl flex flex-col">
        <div
          className={`  w-[100%] z-11 h-[300px] sm:h-[250px] flex flex-col sm:flex-row items-center justify-end sm:justify-start p-5 gap-3 overflow-hidden shadow-lg shadow-black/35 `}
          style={{ background: `${bgColor || "transparent"}` }}
        >
          {" "}
          <div
            className="mr-auto sm:hidden"
            onClick={() => {
              router.back();
            }}
          >
            <FaArrowLeft className="text-lg" />
          </div>
          {/* ________________________________making edit playlist functionality______________________________________________________________________________________________________________ */}
          <div
            className={`w-[150px] h-[150px] sm:min-w-[170px]  sm:h-[170px] xl:min-w-[200px] xl:min-h-[200px]  sm:self-end relative group `}
            // className={`${middleWidth <= 640 ? "w-[150px] h-[150px]" : middleWidth > 640 && middleWidth <= 1024 ? "self-end min-w-[170px] h-[170px]" : "min-w-[200px] min-h-[200px] "}  relative group`}
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            <img
              src={playlist?.image || `/images/notfound.png`}
              alt="playlist-img"
              className={`w-[100%] h-[100%] object-cover rounded-xl shadow-lg shadow-black cursor-pointer `}
            />
            {playlist?.type !== "Liked" && (
              <div className="w-[100%] h-[100%] hover:flex  absolute top-0 right-0 hidden group-hover:block rounded-xl  hover:bg-black/45 cursor-pointer">
                <PiNotePencil className="mx-auto my-auto brightness-150 text-white" size={50} />
              </div>
            )}
          </div>
          {/* ______________________________________________________________________________________________________________________________________________ */}
          <div className="flex justify-start  flex-col sm:items-start sm:justify-end  w-[100%]  max-h-[100%] sm:self-end truncate">
            <p className="font-sans hidden sm:block">{playlist?.type}</p>
            <p
              className="text-2xl sm:text-5xl xl:text-6xl font-sans font-extrabold text-balance   max-w-[100%] overflow-hidden text-ellipsis break-words truncate pb-2"
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}
            >
              {playlist?.name || ""}
            </p>
            <p className="font-sans opacity-70 max-w-[100%] truncate">
              {playlist?.songs?.length !== undefined ? `${playlist.songs.length} songs` : ""} 
            </p>
          </div>
        </div>

        {/* for songs and play playlists button and search */}

        <div
          className={` text-white bg-gradient-to-b   to-zinc-900 h-screen `}
          style={{
            background: `linear-gradient(0deg,#19191b 80%, ${bgColor}80 )`,
          }}
        >
          {playlist?.songs?.length > 0 ? (
            <>
              <div
                className={`sticky top-0 z-10 h-[60px]  flex  items-center justify-between  transition-colors duration-150   py-3 px-5 `}
                style={{
                  background: `${
                    scrolled ? bgColor || "#18181b" : "transparent"
                  }`,
                }}
              >
                {/* playlist play button */}
                <div
                  className="p-2.5  rounded-full bg-green-500  transition-all duration-300  cursor-pointer"
                  onClick={() => {
                    handlePlayFromType(playlist.type, playlist._id);
                  }}
                >
                  <span>
                    {conditionCheck && Context_isPlaying.isPlaying ? (
                      <IoIosPause className="text-3xl  text-black cursor-pointer" />
                    ) : (
                      <IoIosPlay className="text-3xl pl-0.5 text-black cursor-pointer" />
                    )}
                  </span>
                </div>
                {scrolled && (
                  <p className="font-bold font-sans text-xl px-3 mr-auto">
                    {playlist.name || "Playlist"}
                  </p>
                )}

                <div className="max-w-[200px] flex   items-center justify-start backdrop-blur-3xl bg-white/8   transition-all duration-300  rounded-full h-10 border-2 border-transparent  cursor-pointer ">
                  <RiSearchLine
                    className="search-icon  m-2  text-xl text-white"
                    onClick={handleIconClick}
                  />
                  <div
                    className={`${
                      showInput ? `w-[70%]` : `w-[0]`
                    }  overflow-hidden flex justify-start relative`}
                  >
                    <input
                      type="text"
                      className={`input_button w-auto text-amber-50  outline-none transition-all duration-300 `}
                      placeholder="Search in playlist"
                      ref={inputRef}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onBlur={handleBlur}
                    />
                  </div>
                  <div
                    className={`${
                      searchText.length > 0 ? "visible" : "invisible"
                    }   ${
                      showInput ? "block" : "hidden"
                    }  z-10 h-[100%] w-[35px] rounded-r-2xl  ml-auto cursor-pointer transition-all duration-200 `}
                  >
                    <div
                      className="transform rotate-45 active:scale-90 p-0.5 hover:scale-125"
                      onClick={() => {
                        setSearchText("");
                        inputRef.current?.focus();
                      }}
                    >
                      <IoAddOutline className="text-3xl " />
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`group/titleHeader sticky  top-[60px] z-10 px-3  h-10 flex items-center border-b-[0.5px] border-b-[#747474b2]  text-sm font-medium text-gray-300 bg-slate-500    ${
                  scrolled ? "bg-zinc-900 px-8" : "bg-transparent mx-5 "
                }`}
              >
                <div className="w-[40px]  truncate ">#</div>
                <div
                  style={{ width: `${titleWidth}px` }}
                  className={`truncate relative flex items-center `}
                >
                  <span className="">Title</span>
                  <div
                    data-resizer-name="title"
                    ref={resizerRef}
                    onMouseDown={startResizing}
                    className="hidden sm:block absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent group-hover/titleHeader:bg-white"
                  ></div>
                </div>
                <div
                  style={{ width: `${albumWidth}px` }}
                  className="truncate hidden sm:block relative flex items-center "
                >
                  <span className="">Album</span>
                  <div
                    data-resizer-name="album"
                    ref={resizerRef}
                    onMouseDown={startResizing}
                    className="hidden sm:block absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent group-hover/titleHeader:bg-white"
                  ></div>
                </div>
                <div
                  style={{ width: `${dateAddedWidth}px` }}
                  className="mr-auto relative truncate hidden lg:block"
                >
                  <span className="">Date added</span>
                  <div
                    data-resizer-name="date added"
                    ref={resizerRef}
                    onMouseDown={startResizing}
                    className="hidden sm:block absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent group-hover/titleHeader:bg-white "
                  ></div>
                </div>
                <div className=" w-[150px] max-w-[100%]  truncate hidden sm:block sm:flex justify-center">
                  <FaRegClock className="" />
                </div>
              </div>

              {playlist.songs?.map((item, index) => (
                <div className="px-5" key={item.song._id}>
                  <MiddlePlaylistSongCard
                    index={index}
                    item={item.song}
                    added={item.added}
                    showIndexes={true}
                    context={{
                      type: playlist.type,
                      id: playlist._id,
                      name: playlist.name,
                    }}
                    allSongs={playlist.songs}
                    titleWidth={titleWidth}
                    albumWidth={albumWidth}
                    dateAddedWidth={dateAddedWidth}
                  />
                </div>
              ))}
            </>
          ) : (
            <p className="font-bold text-center text-xl p-10">
              + Add Some Songs
            </p>
          )}
        </div>
      </div>
      <div className="w-full h-full">
        {/* <AudioVisualizer audioRef={Context_audio_ref.current} /> */}
      </div>
    </div>
  );
};

export default MiddlePlaylistView;
