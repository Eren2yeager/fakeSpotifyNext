import { BsThreeDots } from "react-icons/bs";
import React, { useState, useEffect , useContext} from "react";
import { AnimatePresence } from "framer-motion";
import { IoMdList } from "react-icons/io";
import Portal from "./Portal";
import { usePlayer } from "@/Contexts/playerContext";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { useOtherContexts } from "@/Contexts/otherContexts";
const MenuItem = ({ startIcon, endIcon, label, onClick }) => (
  <div
    onClick={onClick}
    className="text-sm w-full px-2 py-2 text-left hover:bg-zinc-600 flex items-center gap-2 rounded-md cursor-pointer select-none"
  >
    <span className="w-5">{startIcon}</span>
    <span className="w-full truncate">{label}</span>
    {endIcon && <span className="w-5">{endIcon}</span>}
  </div>
);

const AlbumPlaylistThreeDots = ({ item, type }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const { addToQueue } = usePlayer();
  const toast = useSpotifyToast();
   

  

  const { middleWidth } = useOtherContexts();



  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showPopup]);

  const handleAddToQueue = async () => {
    try {
      const res = await fetch(`/api/play/${type}/${item._id}`);
      const data = await res.json();

      if (data.songs && data.songs.length > 0) {
        addToQueue(data.songs);
        toast({ text: "Added to queue" });
      }
    } catch (err) {
      console.error("Failed to add to queue:", err);
      toast({ text: "Failed to Add to Queue" });
    }
    setShowPopup(false);
  };

  return (
    <>
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
        <BsThreeDots className={`${middleWidth > 640 ? "text-3xl rotate-0" : "text-xl rotate-90"} transform `} />
      </span>
      <AnimatePresence>
        {showPopup && (
          <Portal
            open={showPopup}
            anchorRect={anchor}
            onClose={() => setShowPopup(false)}
          >
            {/* imitation of the ArtistAlbumThreeDots structure */}
            <div
              className="bg-zinc-800 text-white rounded-md shadow-lg p-2 min-w-[200px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* image and name section */}
              {/* <div className="flex gap-1 justify-start mb-2">
                {item?.image && (
                  <img
                    src={item.image}
                    className="min-w-[60px] max-w-[60px] min-h-[60px] max-h-[60px] p-1 object-cover rounded-xl"
                    alt={item?.name}
                    title={item?.name}
                  />
                )}
                <div className="flex flex-col mt-2 h-[30%] w-[100%] justify-start text-xs sm:text-[1em]">
                  <div
                    className="song-name text-wrap overflow-hidden text-ellipsis break-words"
                    style={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                    }}
                  >
                    {item?.name}
                  </div>
                </div>
              </div> */}
              {/* menu items */}
              <MenuItem
                startIcon={<IoMdList className="text-white text-2xl" />}
                label="Add to queue"
                onClick={handleAddToQueue}
              />
              {/* Add more MenuItem components here for more actions if needed */}
            </div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
};

export default AlbumPlaylistThreeDots;
