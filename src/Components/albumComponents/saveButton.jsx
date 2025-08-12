"use client"

import React ,{ useEffect , useState ,useTransition} from 'react'
import { IoMdAddCircleOutline } from "react-icons/io";
import { TiTick } from "react-icons/ti";
import { useLibrary } from '@/Contexts/libraryContext'
import { isSavedAlbum, toggleSavedAlbum } from "@/app/(protected)/actions/albumActions";
import { useRouter } from 'next/navigation'
import { useSpotifyToast } from '@/Contexts/SpotifyToastContext';
const SaveAlbumButton = ({id , onUpdate}) => {
    // const router = useRouter()
    const toast = useSpotifyToast()
 const {fetchLibrary} = useLibrary();
 const [pending , startTransition] = useTransition();
 const [isAlbumSaved, setIsAlbumSaved] = useState(null);
 
  useEffect(() => {
    startTransition(async ()=>{
        const res = await isSavedAlbum(id);
        setIsAlbumSaved(res);
    })
  }, [id])
  
  
  return (
    <button
    title={`${isAlbumSaved ? "Remove from the Library" : "Save to Library"}`}
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await toggleSavedAlbum(id);
          const res = await isSavedAlbum(id);
          setIsAlbumSaved(res);
          fetchLibrary()
          if(res == true){
            toast({text : "Added to Your Library"})
          }else if (res == false){
            toast({text : "Removed from Your Library"})
          }
          if (onUpdate) onUpdate();
        });
      }}
      className={`
        px-3
        rounded-full
        border-2 border-white/50
        bg-transparent
        text-white
        text-sm
        font-semibold
        transition-all duration-200


        ${pending ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {isAlbumSaved ? "Saved" : "Save"}
    </button>
  )
}

export default SaveAlbumButton


