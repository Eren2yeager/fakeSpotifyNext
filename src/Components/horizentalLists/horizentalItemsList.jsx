"use client"

import React, { useState, useRef, useEffect, useContext } from "react";

import SongCard from "./SongCard";
import PlayListCard from "./PlayListCard";
import ArtistCard from "./ArtistCard";
import AlbumCard from "./AlbumCard";
import ProfileCard from "./ProfileCard";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";


const HorizentalItemsList = (props) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const listItems = props.listItems || [{}];

  // for horzental scrolling effect without user scroll
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const parentRef = useRef(null);
  const childRef = useRef(null);

  const checkOverflow = () => {
    if (!parentRef.current) return;
    setShowLeftArrow(parentRef.current.scrollLeft > 0);
    setShowRightArrow(
      parentRef.current.scrollWidth - parentRef.current.scrollLeft >
        parentRef.current.clientWidth + 5
    );
  };

  useEffect(() => {
    const observer = new ResizeObserver(checkOverflow);
    if (parentRef.current) observer.observe(parentRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // for horzental scrolling effect with user scroll

  const handleScroll = (e) => {
    setTimeout(() => {
      setShowLeftArrow(parentRef.current.scrollLeft > 0);
      setShowRightArrow(
        parentRef.current.scrollWidth - parentRef.current.scrollLeft >
          parentRef.current.clientWidth + 5
      );
    }, 200);
  };

  // to scroll left and right
  const scroll = (direction) => {
    const { current } = parentRef;
    if (current) {
      const scrollAmount = parentRef.current.clientWidth + 100; // Adjust the scroll amount as needed
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <div className="relative my-3 px-2 group/horizentalList">
        <div className="font-bold mx-3 py-2 text-xl sm:text-2xl">
          {props.heading}
        </div>
        <div
          className="max-w-[100%] overflow-x-auto overflow-y-hidden scrollbar-hide"
          ref={parentRef}
          onScroll={handleScroll}
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE 10+
          }}
        >
          <style jsx>{`
            div.scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div
            className={`group-hover/horizentalList:opacity-80 opacity-0 transition-opacity duration-200  hidden sm:block bg-zinc-700 p-1  rounded-full absolute cursor-pointer left-0 top-1/3 z-10  ${
              showLeftArrow == false ? `invisible` : "visible"
            } hover:bg-zinc-900`}
            onClick={() => scroll("left")}
          >
            <MdOutlineKeyboardArrowLeft className="text-3xl" />
          </div>

          <div className="flex w-fit h-fit  bg-transparent " ref={childRef}>
            {listItems.map((item, index) => (
              <div
                key={index}

              >
                <Card
                  key={index}
                  item={item}
                  />
              </div>
            ))}
          </div>
          <div
            className={`group-hover/horizentalList:opacity-80 opacity-0 transition-opacity duration-150 hidden sm:block bg-zinc-700 p-1  rounded-full cursor-pointer absolute  right-0 top-1/3 z-10   ${
              showRightArrow == false ? `invisible` : "visible"
            }  hover:bg-zinc-900`}
            onClick={() => scroll("right")}
          >
            <MdOutlineKeyboardArrowRight className="text-3xl" />
          </div>
        </div>
      </div>
    </>
  );
};



const Card=(props)=>{
  return(
    <>
    {
      (props.item.type==="Song") ? <SongCard item={props.item}/> : 
      (props.item.type==="Artist") ? <ArtistCard item={props.item} /> :
      (props.item.type==="Playlist") ? <PlayListCard item={props.item}/> : 
      props.item.type==="Album" ? <AlbumCard item={props.item} />  : props.item.type =="Profile" && <ProfileCard  item={props.item}/>

    }
    </>
  )
}


export default React.memo(HorizentalItemsList);
