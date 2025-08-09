import { IoMdAddCircleOutline } from "react-icons/io";
import { TiTick } from "react-icons/ti";
import React, { useState, useTransition, useEffect } from "react";
import {
  isSongInAnyPlaylist,
  isSongInSpecificPlaylist,
} from "@/app/(protected)/actions/playlistChecks";
import { useLibrary } from "@/Contexts/libraryContext";
import AddToPlaylistPopup from "../popups/AddToPlaylistPopup";
import { toggleLikeSong } from "@/app/(protected)/actions/songActions";

const TickOrAdd = ({song}) => {
  const [isPending, startTransition] = useTransition();
  const [Liked, setLiked] = useState(false);
  const { library, getKeeperPlaylists , fetchLibrary} = useLibrary();

  const handleToggleLike = () => {
    startTransition(async () => {
      await toggleLikeSong(song._id);
      fetchLibrary();
    });
  };


  const checkSongInAnyPlaylist = () => {
    // check for a song is in any play;ist or not
    const keeperPlaylists = getKeeperPlaylists(song._id);
    if (keeperPlaylists?.length > 0) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  };

  useEffect(() => {
    if (song) {
      checkSongInAnyPlaylist();
    }
  }, [library, Liked]);

  const [showPopup, setShowPopup] = useState(false);
  const [anchor, setAnchor] = useState(null);

  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showPopup]);



  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        // some function that will open playlist saved
      }}
    >
      {Liked == true ? (
        <TiTick
          className="text-black bg-green-600 rounded-full  animate-pulse cursor-pointer"
          size={20}
          onClick={(e) => {
            e.stopPropagation()
            setAnchor(e.currentTarget.getBoundingClientRect());
            setShowPopup(true);
            e.preventDefault()
          }}
          onDoubleClick={(e)=>{
            e.stopPropagation()
            e.preventDefault();
         }}
        />
      ) : (
        <IoMdAddCircleOutline className="cursor-pointer" size={20} onClick={handleToggleLike}/>
      )}

      {showPopup && (
        <AddToPlaylistPopup
          song={song}
          anchorRect={anchor}
          onClose={() => setShowPopup(false)}
        />
      )}
    </span>
  );
};

export default React.memo(TickOrAdd);
