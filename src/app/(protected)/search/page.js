"use client";
import React, { memo, useState, useRef, useContext, useEffect } from "react";

import CategoryGrid from "@/Components/categoryGrid";
import SearchBar from "@/Components/Helper/SearchBar";
import RecentSearches from "@/Components/Helper/recentSearches";
import SearchPage from "@/Components/searchComponents/searchPage";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { GLOWAL_SEARCH_TEXT_CONTEXT } from "@/Contexts/search.controls";
const Search = () => {
  const inputRef = useRef(null);
  const Contex_Glowal_search_text = useContext(GLOWAL_SEARCH_TEXT_CONTEXT);
  const { searchedText, setSearchedText } = Contex_Glowal_search_text;
  // for dropdown
  const [isOpen, setIsOpen] = useState(false);
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
        <SearchPage searchQuery={query} />
      )}
    </div>
  );
};

export default Search;
