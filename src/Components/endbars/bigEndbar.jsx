import React, { useState, useRef, useEffect, useContext } from "react";


import EndLeft from "./endLeft";  
import EndRight from "./endRight";
import EndMiddle from "./endMiddle";


const BigEndbar = (props) => {
  return (
    <>
      <footer className="text-amber-50 sm:h-[75px] w-[100%] sticky bottom-0 ">
        <div className={`${props.className}`}>
          <div
            className={`text-white flex justify-between bg-cover h-[75px] w-[100%]`}
          >
            <div className="endbar-left min-w-[25%] h-[100%] flex items-center">
              <EndLeft
                imageUrl={props.imageUrl}
                songName={props.songName}
                artistName={props.artistName}
                setShowRight={props.setShowRight}
              />
            </div>

            <div className="endbar-middle min-w-[50%] h-[100%] ">
              <EndMiddle />
            </div>
            <div className="endbar-right min-w-[25%] h-[100%]">
              <EndRight />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export  default BigEndbar
