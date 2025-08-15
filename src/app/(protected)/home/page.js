"use client";
import React, { useState, useContext, useEffect, useRef } from "react";
import ThreeDotsLoader from "@/Components/Helper/ThreeDotsLoader.jsx";
import FailedToFetch from "@/Components/Helper/failedToFetch.jsx";
import ListRender from "@/Components/Helper/listRender.jsx";
import HorizentalItemsList from "@/Components/horizentalLists/horizentalItemsList.jsx";
import GridCellContainer from "@/Components/Helper/gridCellContainer.jsx";
import { CurrentUserProfileCircle } from "@/Components/Helper/profileCircle";
import { PageTitle } from "@/Components/Helper/PageTitle";

function Home() {
  const [Loading, setLoading] = useState(true); // Start with loading true
  const [isError, setIsError] = useState(false);
  const [homeJson, setHomeJson] = useState(null);
  const [activeItem, setActiveItem] = useState(0);
  const listItems = ["All", "Music", "Playlists"];

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/home?limit=24");
        if (!res.ok) throw new Error("Failed to fetch home");
        const data = await res.json();
        if (!ignore) {
          setHomeJson(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Error fetching home:", err);
        if (!ignore) {
          setIsError(true);
          setLoading(false);
        }
      }
    };
    
    // Small delay to ensure session is ready
    const timer = setTimeout(load, 100);
    return () => { 
      ignore = true; 
      clearTimeout(timer);
    };
  }, []);
    
  const middleNavRef = useRef(null);

  const handleScroll = (e) => {
    const target = e.target;
    if (target.scrollTop > 0) {
      middleNavRef.current.classList.add(
        "shadow-lg",
        "shadow-zinc-900",
        "bg-zinc-900"
      );
      middleNavRef.current.classList.remove("bg-transparent");
    } else {
      middleNavRef.current.classList.remove(
        "shadow-lg",
        "shadow-zinc-900",
        "bg-zinc-900"
      );
      middleNavRef.current.classList.add("bg-transparent");
    }
  };

  return (
    <>
      {/* Set page title - will be overridden by song title if music is playing */}
      <PageTitle title="Home - Fake Spotify" />
      
      {Loading ? 
      <div className="w-[100%] h-[100%] flex items-center justify-center">

      <ThreeDotsLoader/>
      </div>
       :isError ? <div className="w-[100%] h-[100%] flex items-center justify-center"><FailedToFetch /></div>: 
       
       
       
       <>
    
    <div className="w-[100%] h-[100%] justify-center items-center">
            <div className="flex w-[100%]  max-h-[60px] px-5">
              <div className="sm:hidden  flex items-center">
                <CurrentUserProfileCircle />
              </div>
              <div
                className="  w-[100%] overflow-x-auto overflow-y-hidden  bg-transparent rounded-t-xl transition-all duration-500 sticky top-0"
                ref={middleNavRef}
              >
                <ListRender
                  listItems={listItems}
                  className="flex gap-3  h-full p-3  sticky top-0 z-30"
                  activeItem={activeItem}
                  setActiveItem={setActiveItem}
                />
              </div>
              </div>

      {/*for horizental lst  */}
       

      <div
        className="middle-scroll-div min-w-[100%] flex flex-col gap-5 h-[95%]  pb-40 sm:pb-5 overflow-y-auto"
        onScroll={handleScroll}
        > 
        <GridCellContainer />
        {/* Home sections */}
        {activeItem === 0 && (
          <>
            <HorizentalItemsList heading={"New Releases"} listItems={(homeJson?.newReleaseAlbums||[]).map(a=>({ ...a, type: "Album" }))} />
            <HorizentalItemsList heading={"From Artists You Follow"} listItems={(homeJson?.newSongsFromArtists||[]).map(s=>({ ...s, type: "Song" }))} />
            <HorizentalItemsList heading={"Playlists From People You Follow"} listItems={(homeJson?.playlistsFromFollowing||[]).map(p=>({ ...p, type: "Playlist" }))} />
            <HorizentalItemsList heading={"Trending Now"} listItems={(homeJson?.trendingSongs||[]).map(s=>({ ...s, type: "Song" }))} />
          </>
        )}
        {activeItem === 1 && (
          <>
            <HorizentalItemsList heading={"New Releases"} listItems={(homeJson?.newReleaseAlbums||[]).map(a=>({ ...a, type: "Album" }))} />
            <HorizentalItemsList heading={"Trending Songs"} listItems={(homeJson?.trendingSongs||[]).map(s=>({ ...s, type: "Song" }))} />
            <HorizentalItemsList heading={"New From Followed Artists"} listItems={(homeJson?.newSongsFromArtists||[]).map(s=>({ ...s, type: "Song" }))} />
          </>
        )}
        {activeItem === 2 && (
          <>
            <HorizentalItemsList heading={"Playlists From People You Follow"} listItems={(homeJson?.playlistsFromFollowing||[]).map(p=>({ ...p, type: "Playlist" }))} />
            <HorizentalItemsList heading={"New Releases (Albums)"} listItems={(homeJson?.newReleaseAlbums||[]).map(a=>({ ...a, type: "Album" }))} />
          </>
        )}


      </div>
    </div>
        </>
      
    }
    </>
  );
}

export default Home;
