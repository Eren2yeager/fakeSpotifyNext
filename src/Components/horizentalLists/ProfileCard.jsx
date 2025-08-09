"use client"

import React, { useState, useRef, useEffect, useContext } from "react";

import { useRouter } from "next/navigation";
const ProfileCard = (props) => {

  const router = useRouter();


  return (
    <div
      className="p-2 rounded-[5px] group hover:bg-white/8 cursor-pointer transition-all duration-300 relative active:bg-white/15"
      onClick={(e) => {
        router.push(`/profiles/${props.item._id}`);
      }}
    >
      <div className=" w-[95px] sm:w-[150px]  overflow-hidden  m-1  ">
        <div className="w-[100%] h-[95px] sm:h-[150px] ">
          <img
            className="w-[100%] h-[100%] object-cover rounded-full  shadow-lg shadow-gray-950"
            src={`${props.item?.image || "/images/notfound.png"}`}
            alt=""
          />
        </div>
        <div className="flex flex-col mt-2 h-[30%] w-[100%] justify-start text-xs sm:text-[1em] ">
          <div
            className="song-name text-wrap   overflow-hidden text-ellipsis break-words "
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}
          >
            {props.item?.name}
          </div>
          <div className="song-artist  lg:text-wrap max-w-[95%]  lg:max-h-[3em] overflow-hidden truncate opacity-70 text-[0.7em]">
              {props.item?.type}
            </div>
        </div>

        {/* <img className="w-[25%] h-[25%] absolute bottom-0 right-[10%] opacity-0 group-hover:bottom-[35%] group-hover:opacity-100 transition-all duration-300" src="\src\images\playButton.svg" alt="" /> */}
      </div>
    </div>
  );
};

export default React.memo(ProfileCard);
