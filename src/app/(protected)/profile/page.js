"use client";
import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  useTransition,
} from "react";
import { imagePreviewContext, middleWidthContex } from "@/Contexts/contexts";
import { FaArrowLeft } from "react-icons/fa6";
import SuggestBgColor from "@/functions/bgSuggester";
import { useRouter } from "next/navigation";
import { PiNotePencil } from "react-icons/pi";
import { usePlaylists } from "@/Contexts/playlistsContext";
import NotFound from "@/Components/Helper/not-found";
import ThreeDotsLoader from "@/Components/Helper/ThreeDotsLoader";
import HorizentalItemsList from "@/Components/horizentalLists/horizentalItemsList";
import EditProfileModal from "@/Components/popups/EditProfileModal";
import { useUser } from "@/Contexts/userContex";
import { useSession } from "next-auth/react";
import BecomeArtistDialog from "@/Components/popups/BecomeArtistDialog";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
const Profile = () => {
  const router = useRouter();

  const Context_middle_width = useContext(middleWidthContex);
  const { middleWidth } = Context_middle_width;
  const [bgColor, setBgColor] = useState(null);
  const { playlists, fetchPlaylists } = usePlaylists();
  const [isFetching, setisFetching] = useState(false);
  const { userProfile, fetchCurrentUserProfile } = useUser();
  const { data: session, status } = useSession();

  const toast = useSpotifyToast();
  useEffect(() => {
    const setBG = async (image) => {
      if (!image) return;

      try {
        const color = await SuggestBgColor(image);
        setBgColor(color); // or color.rgb
        console.log("bg :", color);
      } catch (err) {
        console.error("Error getting average color:", err);
      }
    };

    if (!userProfile) {
      setisFetching(true);
      fetchCurrentUserProfile()
        .then((data) => {
          setisFetching(false);
          setBG(data?.image);
        })
        .catch((err) => {
          console.error("❌ failed to fetch currentuserdata", err);
        });
    } else {
      setBG(userProfile?.image || session.user.image || "/images/user.jpg");
    }
  }, [userProfile, playlists]); // Only depend on userProfile
  // for header bg on scroll
  const [scrolled, setScrolled] = useState(false);
  const handleScroll = (e) => {
    setScrolled(e.target.scrollTop > 225);
  };

  // for hovering show playbutton

  //   for edit play

  const [isModalOpen, setIsModalOpen] = useState(false);
  //______________________________________________________________________________________________________________________________________________
  //  for become a artist model
  const [open, setOpen] = useState(false);

  //______________________________________________________________________________________________________________________________________________
  const handleClick = () => {
    if (userProfile.isArtist && status == "authenticated") {
      router.push("/artist/dashboard");
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      {isFetching ? (
        <div className="w-[100%] h-[100%] flex items-center justify-center">
          <ThreeDotsLoader />
        </div>
      ) : (
        <div
          className={`scroll-container  relative w-[100%] h-[100%] rounded-xl  overflow-y-auto text-white bg-zinc-900`}
          onScroll={handleScroll}
        >
          {(
            <EditProfileModal
            open={isModalOpen}
              currentUser={userProfile}
              onClose={() => setIsModalOpen(false)}
            />
          )}
          <div className=" w-[100%]   rounded-xl flex flex-col">
            <div
              className={`transition-all duration-300   w-[100%]   flex  ${
                middleWidth > 640
                  ? "flex-row justify-start h-[250px] "
                  : "flex-col  items-center justify-end h-[300px]"
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
              {/* ________________________________making edit playlist functionality______________________________________________________________________________________________________________ */}
              <div
                className={`transition-all duration-300 ${
                  middleWidth < 640
                    ? "min-w-[150px]   max-w-[150px] h-[150px]"
                    : middleWidth > 640 && middleWidth < 1024
                    ? "min-w-[170px] max-w-[170px] h-[170px]  self-end"
                    : middleWidth > 1024 &&
                      "min-w-[200px] h-[200px] max-w-[200px]   self-end"
                } relative group overflow-hidden  shadow-lg shadow-black rounded-full overflow-clip`} // className={`${middleWidth <= 640 ? "w-[150px] h-[150px]" :  " min-w-[170px] h-[170px]"} xl:min-w-[200px] min-h-[200px]  relative group`}
                onClick={() => {
                  setIsModalOpen(true);
                }}
              >
                <img
                  src={
                    userProfile?.image ||
                    session.user?.image ||
                    "/images/user.jpg"
                  }
                  alt="user-img"
                  className={`max-w-full max-h-full min-w-full min-h-full  object-cover  rounded-full  cursor-pointer `}
                />
                <div className="min-w-[100%] min-h-[100%] hover:flex  absolute top-0 right-0 hidden group-hover:block rounded-xl  hover:bg-black/45 cursor-pointer">
                  <PiNotePencil
                    className="mx-auto my-auto brightness-150 text-white"
                    size={50}
                  />
                </div>
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
                  {"Profile"}
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
                  {userProfile?.name || ""}
                </p>
                <div className="font-sans flex  gap-1  max-w-full truncate">
                  <span className="opacity-80">
                    {playlists?.length
                      ? playlists?.length == 1
                        ? `${playlists?.length} Playlist`
                        : `${playlists?.length} Playlists`
                      : ""}
                  </span>
                  <span className="text-white">
                    {userProfile?.followers?.length
                      ? userProfile?.followers?.length == 1
                        ? ` • ${userProfile?.followers?.length} Follower`
                        : ` • ${userProfile?.followers?.length} Followers`
                      : ""}
                  </span>
                  <span className="text-white">
                    {userProfile?.following?.length
                      ? userProfile?.following?.length == 1
                        ? ` • ${userProfile?.following?.length} Following`
                        : ` • ${userProfile?.following?.length} Following`
                      : ""}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={` text-white bg-gradient-to-b   to-zinc-900 h-screen `}
              style={{
                background: `linear-gradient(0deg,#19191b 80%, ${bgColor}80 )`,
              }}
            >
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

                  {scrolled && (
                    <p className="font-bold font-sans text-xl px-3 mr-auto">
                      {userProfile?.name || user._id}
                    </p>
                  )}

                  <div>
                    <button
                      onClick={handleClick}
                      className=" text-white px-4 py-2 rounded-lg bottom-1 border-white  shadow-xs shadow-black"
                      style={{ background: `${bgColor || "transparent"}` }}
                    >
                      {userProfile?.isArtist ? "Go to Artist DashBoard" : "Become a Artist"}
                    </button>

                    {!userProfile?.isArtist && (
                      <BecomeArtistDialog
                        open={open}
                        onClose={() => setOpen(false)}
                      />
                    )}
                  </div>
                </div>
                {playlists?.length > 0 && (
                  <HorizentalItemsList
                    heading={"Playlists"}
                    listItems={playlists}
                  />
                )}
                {userProfile?.followers.length > 0 && (
                  <HorizentalItemsList
                    heading={"Followers"}
                    listItems={userProfile?.followers}
                  />
                )}
                {userProfile?.following.length > 0 && (
                  <HorizentalItemsList
                    heading={"Following"}
                    listItems={userProfile?.following}
                  />
                )}
              </>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(Profile);
