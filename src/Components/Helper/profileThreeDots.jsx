import { BsThreeDots } from "react-icons/bs";

import React, { useState , useEffect } from "react";
import ProfileThreeDotsPopUp from "../popups/profileThreeDotsPop";
const ProfileThreeDots = ({ currentUser }) => {
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
    <div>
      <span
        className="p-1 transform active:scale-90 hover:scale-110 transition-200 cursor-pointer"
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
        <BsThreeDots className="text-3xl transform " />
      </span>
      {/* <AnimatePresence> */}
      {showPopup && (

          <ProfileThreeDotsPopUp
          currentUser={currentUser}
      
            anchorRect={anchor}
            onClose={() => {
              setShowPopup(false);
            }}
          />
        
      )}
      {/* </AnimatePresence> */}
    </div>
  );
};

export default ProfileThreeDots;
