import { BsThreeDots } from "react-icons/bs";

import React, { useState , useEffect } from "react";
import ThreeDotsPopUp from "../popups/songThreeDotsPopUp";
import { AnimatePresence } from "framer-motion";
const ThreeDots = ({ song, playlistId , playlistCreaterId }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [anchor, setAnchor] = useState(null)
  
  
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showPopup]);

  return (
    <>
      <span
        className=" transform active:scale-90  transition-200 cursor-pointer"
        onClick={(e) => {
          setAnchor(e.currentTarget.getBoundingClientRect());
          setShowPopup(true);
          e.stopPropagation();
          e.preventDefault();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <BsThreeDots className="text-xl transform rotate-90 sm:rotate-0" />
      </span>
      {/* <AnimatePresence> */}
      {showPopup && (

          <ThreeDotsPopUp
            open ={showPopup}
            song={song}
            playlistId={playlistId}
            playlistCreaterId={playlistCreaterId}
            anchorRect={anchor}
            onClose={() => {
              setShowPopup(false);
            }}
          />
        
      )}
      {/* </AnimatePresence> */}
    </>
  );
};

export default ThreeDots;
