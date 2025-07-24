"use client";
import React, { memo, useState, useRef, useContext, useEffect } from "react";
import { GoHomeFill, GoHome } from "react-icons/go";
import { BiSolidArchive, BiArchive } from "react-icons/bi";
import { ToggleFullScreenContext } from "../Contexts/contexts";
import SearchBar from "./Helper/SearchBar";
import RecentSearches from "./Helper/recentSearches";
import { GLOWAL_SEARCH_TEXT_CONTEXT } from "../Contexts/search.controls";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

const Navbar = memo(() => {
  const pathname = usePathname();
  const ContextFullScreen = useContext(ToggleFullScreenContext);
  const { searchedText, setSearchedText } = useContext(
    GLOWAL_SEARCH_TEXT_CONTEXT
  );
  const inputRef = useRef(null);
  const { data: session, status } = useSession();

  // for dropdown
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExitFullScreen = () => {
    ContextFullScreen.settoggleFullScreen(false);
  };

  return (
    <header className="w-full sm:flex justify-center sm:justify-between items-center sm:px-5 pt-2 p-1">
      <img
        title="Fake Spotify 🤗"
        src="/images/spotifyImage.svg"
        alt="site-icon"
        className="site-iocn max-w-8 max-h-8 invert hidden sm:block cursor-pointer"
      />

      <div className="w-full sm:w-[500px] flex flex-row justify-center sm:gap-3 my-auto">
        <Link href="/home" onClick={handleExitFullScreen}>
          <span className="home-icon p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition duration-300 hidden sm:block">
            {pathname === "/home" ? (
              <GoHomeFill className="text-2xl text-white" />
            ) : (
              <GoHome className="text-2xl text-white" />
            )}
          </span>
        </Link>

        <div className="relative w-full flex justify-center items-center bg-white sm:bg-zinc-800 gap-2 rounded-lg sm:rounded-2xl h-10 border-3 border-transparent focus-within:border-gray-400 transition-all duration-300">
          <div className="w-full flex items-center gap-2" ref={containerRef}>
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
            {isOpen && searchedText.length === 0 && (
              <div className="hidden sm:block">
                <RecentSearches />
              </div>
            )}
          </div>

          <div className="my-3 px-2 border-l-2 border-zinc-500 hidden sm:block">
            <Link href="/search" onClick={handleExitFullScreen}>
              {pathname === "/search" ? (
                <BiSolidArchive className="text-2xl font-bold text-white" />
              ) : (
                <BiArchive className="text-2xl font-bold text-white" />
              )}
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-2 items-center">
        <img
          title="Updates 🔔"
          src="/images/notification.svg"
          alt="notification-icon"
          className="notification-icon w-7 h-7 py-1 px-1 invert rounded-3xl cursor-pointer hover:bg-zinc-300 transition duration-300 hidden sm:block"
        />
           <Link href="/profile" onClick={handleExitFullScreen}>
        <div className="relative w-10 h-10 sm:flex items-center justify-center hidden sm:block cursor-pointer"
         
        >   
          <div className="absolute inset-0 rounded-full bg-gray-600 opacity-40"></div>
          {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name}
                className=" relative z-2 max-w-7 h-7 brightness-110 rounded-full"
              />
          )}
        </div>
     </ Link>
      </div>
    </header>
  );
});

export default Navbar;
