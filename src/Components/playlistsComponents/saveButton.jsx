"use client";

import React, { useEffect, useState, useTransition } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { TiTick } from "react-icons/ti";
import { useLibrary } from "@/Contexts/libraryContext";
import { toggleSavePublicPlaylist } from "@/app/(protected)/actions/playlistActions";
import { useRouter } from "next/navigation";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
const SavePlaylistButton = ({ id, onUpdate }) => {
  // const router = useRouter()
  const toast = useSpotifyToast();
  const { checkPlaylistExistsById, fetchLibrary } = useLibrary();
  const [pending, startTransition] = useTransition();
  const [isPlaylistSaved, setIsPlaylistSaved] = useState(null);

  useEffect(() => {
    startTransition(async () => {
     setIsPlaylistSaved(await checkPlaylistExistsById(id));
    });
  }, [id]);

  return (
    <button
      title={`${
        isPlaylistSaved ? "Remove from the Library" : "Save to Library"
      }`}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {
           const res = await toggleSavePublicPlaylist(id);
            setIsPlaylistSaved(res);
            if (res == true) {
                toast({ text: "Added to Your Library" });
            } else if (res == false) {
                toast({ text: "Removed from Your Library" });
            }
            await fetchLibrary();
            if (onUpdate) onUpdate();
          } catch (error) {
            toast({
              text: `Error: ${error?.message || "Failed to Save Playlist"}`,
            });
          }
        });
      }}
      className={`
        p-1
        rounded-full
        border-2 border-white/50
        bg-transparent
        text-white
        text-sm
        font-semibold
        transition-all duration-200
        w-auto
        min-w-[100px]
        max-w-[200px]
        ${pending ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {isPlaylistSaved ? "Saved" : "Save"}
    </button>
  );
};

export default SavePlaylistButton;

{
  /* <button
disabled={pending}
onClick={() => {
  startTransition(async () => {
    await toggleSavedAlbum(id);
    const res = await isSavedAlbum(id);
    setIsPlaylistSaved(res);
    fetchLibrary()
    if (onUpdate) onUpdate();
  });
}}
className={`
  rounded-full

  bg-transparent
  text-white
  text-sm
  font-semibold
  transition-all duration-200
  w-auto
  flex items-center justify-center
  ${pending ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
`}
>
{isPlaylistSaved ? <TiTick className="cursor-pointer bg-green-500   text-black  rounded-full" size={30}  /> : <IoMdAddCircleOutline className="cursor-pointer" size={30} />}

</button> */
}
