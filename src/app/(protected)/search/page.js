"use client";
import React, { memo, useState, useRef, useContext, useEffect } from "react";

import CategoryGrid from "@/Components/categoryGrid";
import SearchBar from "@/Components/Helper/SearchBar";
import RecentSearches from "@/Components/Helper/recentSearches";
import SearchPage from "@/Components/searchComponents/searchPage";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useOtherContexts } from "@/Contexts/otherContexts";
import { CurrentUserProfileCircle } from "@/Components/Helper/profileCircle";
import ListRender from "@/Components/Helper/listRender";
const Search = () => {
  const inputRef = useRef(null);
  
  // Add safety check for context to prevent SSR errors
  const contextValue = useOtherContexts();
  const { searchedText = "", setSearchedText = () => {} } = contextValue || {};
  
  // for dropdown
  const [isOpen, setIsOpen] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState(0);
  const containerRef = useRef(null);

  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  // Optional: Clear search text ONLY when this component unmounts (not on route change)
  // useEffect(() => {
  //   return () => {
  //     setSearchedText(""); // Only reset when Search component unmounts
  //   };
  // }, [query]);

  return (
    <div className="relative h-screen  p-3 pb-50   overflow-auto">
      <div className="mb-3 sm:hidden">
        <CurrentUserProfileCircle text={"Search"} />
      </div>

      {window.innerWidth <= 640 && (
        <div className=" z-1 max-w-[100%] flex justify-center items-center mb-3 bg-white sm:bg-zinc-800   rounded-lg sm:rounded-2xl h-10 border-3 border-transparent focus-within:border-gray-400 transition-all duration-300">
          <div className="w-full flex items-center gap-2 " ref={containerRef}>
            <SearchBar
              fromParent={{
                searchedText,
                setSearchedText,
                inputRef,
                isOpen,
                setIsOpen,
                containerRef,
              }}
            />
          </div>
        </div>
      )}
      {query.trim()?.length == 0 ? (
        <div className=" w-full ">
          <CategoryGrid />
        </div>
      ) : (
        <>
          <ListRender
            activeItem={activeNavItem}
            setActiveItem={setActiveNavItem}
            listItems={["All", "Songs", "Albums", "Artists", "Playlists" , "Profiles"]}
            className="flex gap-2"
          />

          <SearchPage searchQuery={query} activeItem={activeNavItem} />
        </>
      )}
    </div>
  );
};

export default Search;
