"use client";
import React, { memo, useEffect } from "react";
import { IoAddOutline } from "react-icons/io5";
import { RiSearchLine, RiSearchEyeFill } from "react-icons/ri";
import { useRouter } from "next/navigation";

const SearchBar = (props) => {
  const router = useRouter();

  useEffect(() => {
    if (props.fromParent.searchedText.length > 0) {
      router.push("/search");
    }
  }, [props.fromParent.searchedText]);

  const isFocused =
    typeof document !== "undefined" &&
    document.activeElement === props.fromParent.inputRef?.current;

  return (
    <>
      {isFocused && props.fromParent.searchedText.length > 0 ? (
        <RiSearchEyeFill className="search-icon my-3 ml-3 text-2xl sm:text-white text-black" />
      ) : (
        <RiSearchLine className="search-icon my-3 ml-3 text-2xl sm:text-white text-black" />
      )}

      <input
        value={props.fromParent.searchedText}
        onChange={(e) => {
          props.fromParent.setSearchedText(e.target.value);
        }}
        type="text"
        className="input_button w-full text-black sm:text-amber-50 font-semibold outline-none"
        placeholder="What do you want to listen to?"
        ref={props.fromParent.inputRef}
        onFocus={() => props.fromParent.setIsOpen(true)}
      />

      <div
        className={`${
          props.fromParent.searchedText.length > 0 ? "visible" : "invisible"
        } z-10 h-full w-[35px] rounded-r-2xl ml-auto cursor-pointer transition-all duration-200`}
      >
        <div
          className="transform rotate-45 active:scale-90 p-0.5 hover:scale-125"
          onClick={() => {
            props.fromParent.setSearchedText("");
            props.fromParent.inputRef.current?.focus();
          }}
        >
          <IoAddOutline className="text-3xl text-black sm:text-white" />
        </div>
      </div>
    </>
  );
};

export default memo(SearchBar);
