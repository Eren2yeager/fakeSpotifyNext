"use client";
import React, { memo, useRef, useState, useContext } from "react";
import { IoAddOutline } from "react-icons/io5";
import { RiSearchLine, RiSearchEyeFill } from "react-icons/ri";
import { useRouter } from "next/navigation";

const SearchBar = (props) => {

  const {setSearchedText} = props.fromParent;
  const router = useRouter();
  const debounceTimeout = useRef(null);
  const [input, setInput] = useState("");
 

  
  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);

    // Debounce router push
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      const query = value.trim();
      setSearchedText(query); // update context if needed

      // Use replace to avoid rerender/scroll/focus loss
      if (query.length > 0) {
        router.replace(`/search?q=${encodeURIComponent(query)}`);
      } else {
        router.replace("/search");
      }
    }, 1000);
  };

  const isFocused =
    typeof document !== "undefined" &&
    document.activeElement === props.fromParent.inputRef?.current;

  return (
    <>
      {isFocused && input.length > 0 ? (
        <RiSearchEyeFill className="search-icon my-3 ml-3 text-2xl sm:text-white text-black" />
      ) : (
        <RiSearchLine className="search-icon my-3 ml-3 text-2xl sm:text-white text-black" />
      )}

      <input
        value={input}
        onChange={handleChange}
        type="text"
        className="input_button w-full text-black sm:text-amber-50 font-semibold outline-none"
        placeholder="What do you want to listen to?"
        ref={props.fromParent.inputRef}
        onFocus={() => props.fromParent.setIsOpen(true)}
        autoComplete="off"
        spellCheck={false}
      />

      <div
        className={`${
          input.length > 0 ? "visible" : "invisible"
        } z-10 h-full w-[35px] rounded-r-2xl ml-auto cursor-pointer transition-all duration-200`}
      >
        <div
          className="transform rotate-45 active:scale-90 p-0.5 hover:scale-125"
          onClick={() => {
            setInput("");
            setSearchedText("");
            router.replace("/search");
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
