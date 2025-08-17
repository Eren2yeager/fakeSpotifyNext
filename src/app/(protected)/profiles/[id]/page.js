"use client";
import React, {
  useState,
  useRef,
  useContext,
  useEffect,
  useTransition,
} from "react";
import { useOtherContexts } from "@/Contexts/otherContexts";

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

import ProfileThreeDots from "@/Components/Helper/profileThreeDots";
import { useParams } from "next/navigation";
import Followbutton from "@/Components/artistsComponents/followbutton";

const Profile = () => {
  const router = useRouter();


  const { middleWidth , setImagefullViewSrc } = useOtherContexts();
  const [bgColor, setBgColor] = useState(null);
  const { library } = useLibrary() || {};
  const [isPending, startTransition] = useTransition();
  const { userProfile, fetchCurrentUserProfile, fetchUserData } = useUser() || {};
  const [profile, setProfile] = useState(null);
  const [isUpdated, setIsUpdated] = useState(null);
  const { data: session, status } = useSession() || {};
  const params = useParams() || {};
  const slug = params?.id;

  useEffect(() => {
    if (!session || !session?.user || !slug) return;
    startTransition(async () => {
      setIsUpdated(false);
      if (slug === session?.user._id) {
        fetchCurrentUserProfile()
          .then((data) => {
            setProfile(data);
            const img =
              (data && data.image) ||
              (session?.user && session?.user.image) ||
              "/images/user.jpg";
            if (img) {
              SuggestBgColor(img)
                .then((color) => {
                  setBgColor(color);
                })
                .catch((err) => {
                  console.error("Error getting average color:", err);
                });
            }
          })
          .catch((err) => {
            setProfile(null);
            console.error("❌ failed to fetch currentuserdata", err);
          });
      } else {
        fetchUserData(slug)
          .then((data) => {
            setProfile(data);
            const setBG = async () => {
              if (!data || !data.image) return;
              try {
                const color = await SuggestBgColor(data.image);
                setBgColor(color);
              } catch (err) {
                console.error("Error getting average color:", err);
              }
            };
            setBG();
          })
          .catch((err) => {
            setProfile(null);
            console.error("❌ Error fetching user:", err);
          });
      }
    });
  }, [library, session, isUpdated, slug, fetchCurrentUserProfile, fetchUserData]);

  // for header bg on scroll
  const [scrolled, setScrolled] = useState(false);
  const handleScroll = (e) => {
    setScrolled(e.target.scrollTop > 225);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Defensive: handle undefined session, user, library, profile
  const publicPlaylists =
    session && session?.user && slug === session?.user._id
      ? (library?.playlists || []).filter((pl) => pl?.isPublic)
      : profile?.publicPlaylists || [];

  // Defensive: followers/following fallback to empty arrays
  const followersUsers = profile?.followers?.users || [];
  const followersArtists = profile?.followers?.artists || [];
  const followingUsers = profile?.following?.users || [];
  const followingArtists = profile?.following?.artists || [];

  // Defensive: session?.user fallback
  const userId = session?.user?._id || "";
  const userType = session?.user?.type || "";

  // Defensive: profile name fallback
  const profileName = profile?.name || userId || "";

  // Defensive: profile type fallback
  const profileType = profile?.type || "";

  // Defensive: profile image fallback
  const profileImage = profile?.image || "/images/user.jpg";

  // Defensive: check if loading or not found
  if (!isPending && profile === null && slug) {
    // If profile is null after fetch, show NotFound
    return <NotFound />;
  }

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
          {session && session?.user && slug === session?.user._id && isModalOpen && (
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
                } relative group overflow-hidden  shadow-lg shadow-black rounded-full `}
                onClick={() => {
                  if (session && session?.user && slug === session?.user._id) {
                    setIsModalOpen(true);
                  }else {
                  
                      setImagefullViewSrc(profileImage || null);
                   
                  }
                }}
              >
                <img
                  src={profileImage}
                  alt="user-img"
                  className={`max-w-full max-h-full min-w-full min-h-full  object-cover  rounded-full  cursor-pointer `}
                />
                {session && session?.user && slug === session?.user._id && (
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
                  {profileType}
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
                  {profileName}
                </p>

                <div className="font-sans flex flex-wrap  gap-1  max-w-full truncate">
                  <span
                    className={`font-sans transition-all duration-300  ${
                      middleWidth > 640 ? "hidden" : ""
                    }`}
                  >
                    {profileType ? `${profileType} •` : ""}
                  </span>
                  <span className="">
                    {publicPlaylists.length
                      ? publicPlaylists.length === 1
                        ? `${publicPlaylists.length} Public Playlist`
                        : `${publicPlaylists.length} Public Playlists`
                      : ""}
                  </span>
                  <span className="text-white">
                    {followersUsers.length + followersArtists.length
                      ? followersUsers.length + followersArtists.length === 1
                        ? ` • ${followersUsers.length + followersArtists.length} Follower`
                        : ` • ${followersUsers.length + followersArtists.length} Followers`
                      : ""}
                  </span>
                  <span className="text-white">
                    {followingUsers.length + followingArtists.length
                      ? followingUsers.length + followingArtists.length === 1
                        ? ` • ${followingUsers.length + followingArtists.length} Following`
                        : ` • ${followingUsers.length + followingArtists.length} Following`
                      : ""}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={` text-white bg-gradient-to-b   to-zinc-900 h-screen `}
              style={{
                background: `linear-gradient(0deg,#19191b 80%, ${bgColor || "#19191b"}80 )`,
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
                      {profileName}
                    </p>
                  )}
                  {session && session?.user && slug !== session?.user._id && (
                    <p
                      className={`font-bold font-sans text-xl px-3 mr-auto max-w-full truncate ${
                        scrolled ? "hidden" : ""
                      }`}
                    >
                      <Followbutton
                        followObject={{
                          followerId: userId,
                          followerType: userType,
                          targetId: profile?._id || "",
                          targetType: profileType,
                        }}
                        onUpdate={() => {
                          setIsUpdated(true);
                        }}
                      />
                    </p>
                  )}

                  {session && session?.user && slug === session?.user._id && (
                    <ProfileThreeDots currentUser={profile}               onUpdate={() => {
                      setIsUpdated(true);
                    }} />
                  )}
                </div>
                {publicPlaylists.length > 0 && (
                  <HorizentalItemsList
                    heading={"Public Playlists"}
                    listItems={publicPlaylists}
                  />
                )}
                {(followersUsers.length > 0 || followersArtists.length > 0) && (
                  <HorizentalItemsList
                    heading={"Followers"}
                    listItems={[
                      ...followersArtists,
                      ...followersUsers,
                    ]}
                  />
                )}
                {(followingUsers.length > 0 || followingArtists.length > 0) && (
                  <HorizentalItemsList
                    heading={"Following"}
                    listItems={[
                      ...followingArtists,
                      ...followingUsers,
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
