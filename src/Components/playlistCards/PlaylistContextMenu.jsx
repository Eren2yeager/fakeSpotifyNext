"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CiLock } from "react-icons/ci";
import { IoIosGlobe } from "react-icons/io";
import Portal from "../Helper/Portal";
import { deletePlaylist } from "@/app/(protected)/actions/playlistActions";
import EditPlaylistModal from "../popups/updatePlaylistModel";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useLibrary } from "@/Contexts/libraryContext";
import { togglePlaylistPublic } from "@/app/(protected)/actions/playlistActions";
import { useConfirm } from "@/Contexts/confirmContext";

export default function PlaylistContextMenu({
  playlist,

  open,
  onClose,
  anchorRect,
}) {
  const [isPending, startTransition] = useTransition();
  const toast = useSpotifyToast();
  const confirm =  useConfirm()

  const router = useRouter();
  const pathname = usePathname();
  const { fetchLibrary } = useLibrary();
  const [openEdit, setOpenEdit] = useState(false);
  const handleDelete = () => {
    startTransition(async () => {
      const ok = await deletePlaylist(playlist._id);
      if (ok == true) {
        toast({
          text: `${playlist.name} deleted`,
          image: playlist.image,
        });
        if (pathname == `/playlists/${playlist._id}`) {
          router.back();
        }
        fetchLibrary();
      }
    });
  };
  const handleTogglePlaylistPublic = () => {
    startTransition(async () => {
      try {
        const ok = await togglePlaylistPublic(playlist._id);
        if (ok == true) {
          toast({
            text: `${playlist.name} is now public`,
            image: playlist.image,
          });
        } else if (ok == false) {
          toast({
            text: `${playlist.name} is now Private`,
            image: playlist.image,
          });
        }
        fetchLibrary();
      } catch (error) {
        toast({
          text: `Error: ${error?.message || "Failed to toggle playlist privacy"}`,
         
        });
      }
    });
  };


  return (
    <Portal open={open} onClose={onClose} anchorRect={anchorRect}>
      <div className="flex gap-1 justify-start items-center">
        <img
          src={`${playlist?.image}`}
          className={`min-w-[60px] max-w-[60px] min-h-[60px] max-h-[60px] p-1 object-cover rounded-xl `}
          alt={playlist?.name}
          title={playlist?.name}
        />
        <p
          className="text-wrap   overflow-hidden text-ellipsis break-words p-1"
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
          }}
        >
          {playlist?.name}
        </p>
      </div>
      <button
        onClick={() => {
          setOpenEdit(true);
        }}
        className="w-full px-4 py-2 text-left hover:bg-zinc-600 flex items-center gap-5 justify-start rounded-md"
      >
        <lord-icon
          src="https://cdn.lordicon.com/exymduqj.json"
          trigger="hover"
          stroke="bold"
          state="hover-line"
          colors="primary:#ffffff,secondary:#e4e4e4"
          style={{ width: "20px", height: "20px" }}
        ></lord-icon>
        <span>Edit details</span>
      </button>
      <button
        onClick={async () => {
          if (await confirm({text :"Are you sure you want to delete this playlist?"})) {
            handleDelete();
          }
        }}
        className="w-full px-4 py-2 text-left  hover:bg-zinc-600 flex items-center gap-5 justify-start  rounded-md"
      >
        <lord-icon
          src="https://cdn.lordicon.com/jzinekkv.json"
          trigger="hover"
          stroke="bold"
          colors="primary:#ffffff,secondary:#e4e4e4"
          style={{ width: "20px", height: "20px" }}
        ></lord-icon>
        <span>Delete</span>
      </button>
      <button
        onClick={handleTogglePlaylistPublic}
        className="w-full px-4 py-2 text-left  hover:bg-zinc-600 flex items-center gap-5 justify-start  rounded-md"
      >
        {playlist.isPublic ? (
          <CiLock className="cursor-pointer" size={20} />
        ) : (
          <IoIosGlobe className="cursor-pointer" size={20} />
        )}
        <span>{playlist.isPublic ? "Make Private" : "Make Public"}</span>
      </button>
      {
        <EditPlaylistModal
          playlist={playlist}
          onClose={() => setOpenEdit(false)}
          open={openEdit}
        />
      }
    </Portal>
  );
}
