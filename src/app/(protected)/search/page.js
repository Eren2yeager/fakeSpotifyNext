"use client"
import React, { memo, useState, useRef, useContext, useEffect } from "react";

import CategoryGrid from "@/Components/categoryGrid";
import SearchBar from "@/Components/Helper/SearchBar";
import RecentSearches from "@/Components/Helper/recentSearches";
import { GLOWAL_SEARCH_TEXT_CONTEXT } from "@/Contexts/search.controls";
import SearchPage from "@/Components/searchComponents/searchPage";

const Search = () => {
  const Contex_Glowal_search_text = useContext(GLOWAL_SEARCH_TEXT_CONTEXT);
  const { searchedText, setSearchedText } = Contex_Glowal_search_text;

  const inputRef = useRef(null);

  // for dropdown
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  return (
    <div className="relative h-screen  p-3 pb-50   overflow-auto">
      <div className=" z-1 max-w-[100%] flex justify-center items-center mb-3 bg-white sm:bg-zinc-800  sm:hidden  rounded-lg sm:rounded-2xl h-10 border-3 border-transparent focus-within:border-gray-400 transition-all duration-300">
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
      {searchedText?.length == 0 ? (
        <div className=" w-full ">
          <CategoryGrid />
        </div>
      ) : (
        <SearchPage searchQuery={searchedText}/>
      )}
    </div>
  );
};

export default Search;
