import React,{useEffect ,useState} from 'react'
import { GrAdd } from "react-icons/gr";
import CreatePlaylistPopup from '../popups/createPlaylistPopup';
const AddButton = ({wantText,tailwindBg}) => {
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
    <div
    title="Create new Playlist"
    className={` w-auto flex justify-center items-center ml-1 p-2 rounded-full hover:bg-zinc-700 transition-all duration-500 ${tailwindBg} cursor-pointer`}
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
    <GrAdd
      className={`text-xl transform transition-transform duration-300 ${
        showPopup ? " rotate-45" : "rotate-0"
      }`}
    />
    {wantText  && (
     <p className="font-bold pl-1 hidden sm:block">Create</p> 
     )} 

    {showPopup && (
      <CreatePlaylistPopup
        className={
          "absolute z-100 bottom-0 left-0 w-full sm:top-[70px] sm:bottom-auto sm:left-50 sm:w-[300px] bg-zinc-700  text-white p-2 rounded-lg shadow-lg"
        }
        onClose={() => setShowPopup(false)}
        anchorRect={anchor}
      />
    )}
  </div>
  )
}

export default AddButton