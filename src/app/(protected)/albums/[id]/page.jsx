"use client";
import React, { useState, useRef, useContext, useEffect } from "react";
import { IoIosPlay } from "react-icons/io";
import { IoIosPause } from "react-icons/io";
import { useOtherContexts } from "@/Contexts/otherContexts";

import { useParams } from "next/navigation";
import { FaRegClock } from "react-icons/fa";
import { IoAddOutline } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa6";

import { RiSearchLine } from "react-icons/ri";
import { usePlayer } from "@/Contexts/playerContext";
import MiddlePlaylistSongCard from "@/Components/playlistCards/middlePlaylistSongCard";
import SuggestBgColor from "@/functions/bgSuggester";
import { useRouter } from "next/navigation";

import NotFound from "@/Components/Helper/not-found";
import ThreeDotsLoader from "@/Components/Helper/ThreeDotsLoader";
import ImagePreviewer from "@/Components/Helper/ImagePreviewer";
import HorizentalItemsList from "@/Components/horizentalLists/horizentalItemsList";
import ProfileCircle from "@/Components/Helper/profileCircle";
import SaveAlbumButton from "@/Components/albumComponents/saveButton";
import AlbumPlaylistThreeDots from "@/Components/Helper/AlbumPlaylistThreeDots";
const MiddlePlaylistView = () => {
  const router = useRouter();
  const [isUpdated, setIsUpdated] = useState(false);

  const { middleWidth ,setImagefullViewSrc } = useOtherContexts();

  const params = useParams();
  const slug = params.id;

  const [bgColor, setBgColor] = useState(null);
  const [album, setAlbum] = useState(null);

  // for search
  const [showInput, setShowInput] = useState(false);
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef(false);

  const [isFetching, setisFetching] = useState(true);
  useEffect(() => {
    setIsUpdated(false);
    fetch(`/api/albums/${slug}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch album");
        }
        return res.json();
      })
      .then((data) => {
        setAlbum(data);
        setisFetching(false);
        const setBG = async () => {
          if (!data?.image) return;

          try {
            const color = await SuggestBgColor(data.image);
            setBgColor(color); // or color.rgb
  
          } catch (err) {
            console.error("Error getting average color:", err);
          }
        };

        setBG();
      })
      .catch((err) => {
        setisFetching(false);

        console.error("❌ Error fetching albums:", err);
      });
  }, [slug, isUpdated]);

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

  // to play the song from album or just a song
  const { handlePlayFromType, conditionCheckForSong, isPlaying } = usePlayer();

  // it will tell the what is currenty album
  const conditionCheck = conditionCheckForSong(album);

  //   for edit play

  const [isModalOpen, setIsModalOpen] = useState(false);

  const searchResults = album?.songs.filter((song) =>
    song.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      {isFetching ? (
        <div className="w-[100%] h-[100%] flex items-center justify-center">
          <ThreeDotsLoader />
        </div>
      ) : (
        <div
          className={`scroll-container  relative w-[100%] h-[100%] rounded-xl  overflow-y-auto text-white bg-zinc-900  pb-50`}
          onScroll={handleScroll}
        >
          <div className=" w-[100%]   rounded-xl flex flex-col">
            <div
              className={`transition-all duration-300   w-[100%] z-11  flex  ${
                middleWidth > 640
                  ? "flex-row justify-start  "
                  : "flex-col  items-center justify-end "
              }    p-5 gap-3 overflow-hidden shadow-lg shadow-black/35 `}
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
              {/* ________________________________making edit album functionality______________________________________________________________________________________________________________ */}
              <div
                className={`transition-all duration-300 ${
                  middleWidth < 640
                    ? "min-w-[150px]   max-w-[150px] h-[150px]"
                    : middleWidth > 640 && middleWidth < 1024
                    ? "min-w-[170px] max-w-[170px] h-[170px]  self-end"
                    : middleWidth > 1024 &&
                      "min-w-[200px] h-[200px] max-w-[200px]   self-end"
                } relative group overflow-hidden rounded-xl shadow-lg shadow-black`} // className={`${middleWidth <= 640 ? "w-[150px] h-[150px]" :  " min-w-[170px] h-[170px]"} xl:min-w-[200px] min-h-[200px]  relative group`}
                onClick={() => {
                  setImagefullViewSrc(album?.image || null);
                }}
              >
                <img
                  src={album?.image || `/images/notfound.png`}
                  alt="album-img"
                  className={`max-w-full max-h-full min-w-full min-h-full object-cover  cursor-pointer rounded-xl`}
                />
              </div>
              {/* ______________________________________________________________________________________________________________________________________________ */}
              <div
                className={`flex flex-col ${
                  middleWidth < 640
                    ? "justify-start "
                    : "items-start justify-end self-end"
                }    w-[100%]  max-h-[100%]  truncate transition-all duration-300 `}
              >
                <p
                  className={`font-sans transition-all duration-300   ${
                    middleWidth > 640 ? "block" : "hidden"
                  }`}
                >
                  {album?.type}
                </p>
                <p
                  className={`${
                    middleWidth < 640
                      ? "text-2xl pb-1"
                      : middleWidth > 640 && middleWidth < 1024
                      ? "text-4xl pb-2"
                      : middleWidth > 1024 && "text-6xl pb-2"
                  }  font-sans font-extrabold text-balance   max-w-[100%] overflow-hidden text-ellipsis break-words truncate transition-all duration-300 `}
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                  }}
                >
                  {album?.name || "Album"}
                </p>

                <div className={`${middleWidth > 640 ? "hidden" : ""}`}>
                  {album ? (
                    <ProfileCircle
                      image={album?.artist?.image || "/images/user.jpg"}
                      text={album?.artist?.name}
                      onClick={() => {
                        router.push(`/artists/${album?.artist?._id}`);
                      }}
                    />
                  ) : (
                    ""
                  )}
                </div>

                <div className="font-sans flex  gap-1 items-center  max-w-full truncate">
                  {album ? (
                    <div className={`${middleWidth < 640 ? "hidden" : ""}`}>
                      <ProfileCircle
                        image={album?.artist?.image || "/images/user.jpg"}
                        text={album?.artist?.name}
                        onClick={() => {
                          router.push(`/artists/${album?.artist?._id}`);
                        }}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                  {/* <span className={` ${middleWidth < 640 ?" hidden" :""}`}> • </span> */}
                  <span
                    className={`font-sans transition-all duration-300  ${
                      middleWidth > 640 ? "hidden" : ""
                    }`}
                  >
                    {album?.type !== undefined ? `${album?.type} ` : ""}
                  </span>

                  <span className="opacity-80">
                    {album?.songs?.length
                      ? album.songs.length == 1
                        ? ` • ${album.songs.length} song`
                        : ` • ${album.songs.length} songs`
                      : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* for songs and play albums button and search */}

            <div
              className={` text-white bg-gradient-to-b   to-zinc-900 h-auto `}
              style={{
                background: `linear-gradient(0deg,#19191b 80%, ${bgColor}80 )`,
              }}
            >
              <div
                className={`sticky top-0 z-10 h-[60px]  flex  items-center justify-between  transition-colors duration-150   py-3 px-5 `}
                style={{
                  background: `${
                    scrolled ? bgColor || "#18181b" : "transparent"
                  }`,
                }}
              >
                {/* album play button */}
                <div
                  className="p-2.5  rounded-full bg-green-500  transition-all duration-300  cursor-pointer"
                  onClick={() => {
                    handlePlayFromType(album);
                  }}
                >
                  <span>
                    {conditionCheck && isPlaying ? (
                      <IoIosPause className="text-3xl  text-black cursor-pointer" />
                    ) : (
                      <IoIosPlay className="text-3xl pl-0.5 text-black cursor-pointer" />
                    )}
                  </span>
                </div>

                {scrolled && (
                  <p className="font-bold font-sans text-xl px-3 mr-auto max-w-full">
                    {album.name || "Playlist"}
                  </p>
                )}

                <div
                  className={`font-bold font-sans text-xl px-3 mr-auto max-w-full truncate  flex gap-5  ${
                    scrolled ? "hidden" : ""
                  }`}
                >
                  <SaveAlbumButton
                    id={album._id}
                    onUpdate={() => {
                      setIsUpdated(true);
                    }}
                  />
                  <div className="flex items-center">

                  <AlbumPlaylistThreeDots item={album} type={album.type} />
                  </div>
                </div>
         

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
                      placeholder="Search in album"
                      ref={inputRef}
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                      }}
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
                  //   style={{ width: `${titleWidth}px` }}
                  className={`truncate relative flex items-center w-full`}
                >
                  <span className="">Title</span>
                  <div
                    data-resizer-name="title"
                    ref={resizerRef}
                    onMouseDown={startResizing}
                    className="hidden sm:block absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent group-hover/titleHeader:bg-white"
                  ></div>
                </div>

                <div className=" w-[150px] max-w-[100%] ml-auto truncate hidden sm:block sm:flex justify-center">
                  <FaRegClock className="" />
                </div>
              </div>
              {searchResults.length === 0 && (
                <NotFound
                  icon={
                    <lord-icon
                      src="https://cdn.lordicon.com/wjyqkiew.json"
                      trigger="loop"
                      delay="1000"
                      state="morph-cross"
                      colors={`primary:#ffffff,secondary:${bgColor}`}
                      style={{ width: 150, height: 150 }}
                    ></lord-icon>
                  }
                  text={"Not found"}
                  position={"top"}
                />
              )}

              {searchResults?.map((item, index) => (
                <div className="px-5" key={index}>
                  <MiddlePlaylistSongCard
                    index={index}
                    item={item}
                    added={item.createdAt}
                    showIndexes={true}
                    context={{
                      type: album.type,
                      id: album._id,
                      name: album.name,
                    }}
                    allSongs={album.songs}
                    titleWidth={titleWidth}
                    albumWidth={albumWidth}
                    dateAddedWidth={dateAddedWidth}
                    albumId={album._id}
                    wantAdded={false}
                    wantAlbum={false}
                    searchText ={searchText}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(MiddlePlaylistView);
