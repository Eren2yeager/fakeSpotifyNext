"use client";
import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  useTransition,
} from "react";
import { imagePreviewContext, middleWidthContext } from "@/Contexts/contexts";
import { FaArrowLeft } from "react-icons/fa6";
import SuggestBgColor from "@/functions/bgSuggester";
import { useRouter } from "next/navigation";
import { PiNotePencil } from "react-icons/pi";
import { useLibrary } from "@/Contexts/libraryContext";
import NotFound from "@/Components/Helper/not-found";
import ThreeDotsLoader from "@/Components/Helper/ThreeDotsLoader";
import HorizentalItemsList from "@/Components/horizentalLists/horizentalItemsList";
import EditProfileModal from "@/Components/popups/EditProfileModal";
import { useUser } from "@/Contexts/userContex";
import { useSession } from "next-auth/react";
import BecomeArtistDialog from "@/Components/popups/BecomeArtistDialog";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import ProfileThreeDots from "@/Components/Helper/profileThreeDots";
import { useParams } from "next/navigation";
import Followbutton from "@/Components/artistsComponents/followbutton";
const Profile = () => {
  const router = useRouter();

  const Context_middle_width = useContext(middleWidthContext);
  const { middleWidth } = Context_middle_width;
  const [bgColor, setBgColor] = useState(null);
  const { library } = useLibrary();
  // const [isFetching, setisFetching] = useState(false);
  const [isPending , startTransition] = useTransition();
  const { userProfile, fetchCurrentUserProfile, fetchUserData } = useUser();
  const [profile, setProfile] = useState(null);
  const [isUpdated, setIsUpdated] = useState(null);
  const { data: session, status } = useSession();
  const params = useParams();
  const slug = params.id;
  // why not getting bg
  useEffect(() => {
    // If userProfile is not loaded, fetch it first
    startTransition( async ()=>{




    setIsUpdated(false);
    if (slug == session.user._id) {
      // if (!userProfile) {
        fetchCurrentUserProfile()
          .then((data) => {
            setProfile(data);
            // After fetching, set the background color based on the image
            const img =
              data?.image || session?.user?.image || "/images/user.jpg";
            if (img) {
              SuggestBgColor(img)
                .then((color) => {
                  setBgColor(color);
                  console.log("bg :", color);
                })
                .catch((err) => {
                  console.error("Error getting average color:", err);
                });
            }
          })
          .catch((err) => {
            console.error("❌ failed to fetch currentuserdata", err);
          });

    } else {
      fetchUserData(slug)
        .then((data) => {
          setProfile(data);
          const setBG = async () => {
            if (!data?.image) return;

            try {
              const color = await SuggestBgColor(data.image);
              setBgColor(color); // or color.rgb
              console.log("bg :", color);
            } catch (err) {
              console.error("Error getting average color:", err);
            }
          };

          setBG();
        })
        .catch((err) => {

          console.error("❌ Error fetching user:", err);
        });
    }
  })
  }, [ library, session, isUpdated]);
  // for header bg on scroll
  const [scrolled, setScrolled] = useState(false);
  const handleScroll = (e) => {
    setScrolled(e.target.scrollTop > 225);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const publicPlaylists =
    slug == session.user._id
      ? library?.playlists?.filter((pl) => pl.isPublic)
      : profile?.publicPlaylists

  return (
    <>
      {isPending ? (
        <div className="w-[100%] h-[100%] flex items-center justify-center">
          <ThreeDotsLoader />
        </div>
      ) : (
        <div
          className={`scroll-container  relative w-[100%] h-[100%] rounded-xl  overflow-y-auto text-white bg-zinc-900`}
          onScroll={handleScroll}
        >
          {slug == session.user._id && (
            <EditProfileModal
              open={isModalOpen}
              currentUser={profile}
              onClose={() => setIsModalOpen(false)}
              onUpdate={() => {
                setIsUpdated(true);
              }}
            />
          )}
          <div className=" w-[100%]   rounded-xl flex flex-col">
            <div
              className={`transition-all duration-300   w-[100%]   flex  ${
                middleWidth > 640
                  ? "flex-row justify-start  "
                  : "flex-col  items-center justify-end"
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
              {/* ________________________________making edit prof functionality______________________________________________________________________________________________________________ */}
              <div
                className={`transition-all duration-300 ${
                  middleWidth < 640
                    ? "min-w-[150px]   max-w-[150px] h-[150px]"
                    : middleWidth > 640 && middleWidth < 1024
                    ? "min-w-[170px] max-w-[170px] h-[170px]  self-end"
                    : middleWidth > 1024 &&
                      "min-w-[200px] h-[200px] max-w-[200px]   self-end"
                } relative group overflow-hidden  shadow-lg shadow-black rounded-full `} // className={`${middleWidth <= 640 ? "w-[150px] h-[150px]" :  " min-w-[170px] h-[170px]"} xl:min-w-[200px] min-h-[200px]  relative group`}
                onClick={() => {
                  if (slug == session.user._id) {
                    setIsModalOpen(true);
                  }
                }}
              >
                <img
                  src={profile?.image || "/images/user.jpg"}
                  alt="user-img"
                  className={`max-w-full max-h-full min-w-full min-h-full  object-cover  rounded-full  cursor-pointer `}
                />
                {slug == session.user._id && (
                  <div className="min-w-[100%] min-h-[100%] hover:flex  absolute top-0 right-0 hidden group-hover:block rounded-xl  hover:bg-black/45 cursor-pointer">
                    <PiNotePencil
                      className="mx-auto my-auto brightness-150 text-white"
                      size={50}
                    />
                  </div>
                )}
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
                  {profile?.type}
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
                  {profile?.name || ""}
                </p>

                <div className="font-sans flex flex-wrap  gap-1  max-w-full truncate">
                <span
                    className={`font-sans transition-all duration-300  ${
                      middleWidth > 640 ? "hidden" : ""
                    }`}
                  >
                    {profile?.type !== undefined ? `${profile?.type} •` : ""}
                  </span>
                  <span className="">
                    {publicPlaylists?.length
                      ? publicPlaylists?.length == 1
                        ? `${publicPlaylists?.length} Public Playlist`
                        : `${publicPlaylists?.length} Public Playlists`
                      : ""}
                  </span>
                  <span className="text-white">
                    {profile?.followers.users.length +
                    profile?.followers.artists.length
                      ? profile?.followers.users.length +
                          profile?.followers.artists.length ==
                        1
                        ? ` • ${
                            profile?.followers.users.length +
                            profile?.followers.artists.length
                          } Follower`
                        : ` • ${
                            profile?.followers.users.length +
                            profile?.followers.artists.length
                          } Followers`
                      : ""}
                  </span>
                  <span className="text-white">
                    {profile?.following.users.length +
                    profile?.following.artists.length
                      ? profile?.following.users.length +
                          profile?.following.artists.length ==
                        1
                        ? ` • ${
                            profile?.following.users.length +
                            profile?.following.artists.length
                          } Following`
                        : ` • ${
                            profile?.following.users.length +
                            profile?.following.artists.length
                          } Following`
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
                      {profile?.name || user._id}
                    </p>
                  )}
                  {slug !== session.user._id && (
                    <p
                      className={`font-bold font-sans text-xl px-3 mr-auto max-w-full truncate ${
                        scrolled ? "hidden" : ""
                      }`}
                    >
                      <Followbutton
                        followObject={{
                          followerId: session.user._id,
                          followerType: session.user.type,
                          targetId: profile?._id,
                          targetType: profile?.type,
                        }}
                        onUpdate={() => {
                          setIsUpdated(true);
                        }}
                      />
                    </p>
                  )}

                  {slug === session.user._id &&
                  
                  <ProfileThreeDots currentUser={profile} />
                  }
                </div>
                {publicPlaylists?.length > 0 && (
                  <HorizentalItemsList
                    heading={"Public Playlists"}
                    listItems={publicPlaylists}
                  />
                )}
                {profile?.followers.users.length +
                  profile?.followers.artists.length >
                  0 && (
                  <HorizentalItemsList
                    heading={"Followers"}
                    listItems={[
                      ...profile?.followers.artists,
                      ...profile?.followers.users,
                    ]}
                  />
                )}
                {profile?.following.users.length +
                  profile?.following.artists.length && (
                  <HorizentalItemsList
                    heading={"Following"}
                    listItems={[
                      ...profile?.following.artists,
                      ...profile?.following.users,
                    ]}
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
