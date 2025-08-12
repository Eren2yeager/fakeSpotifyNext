import React ,{ useEffect , useState ,useTransition} from 'react'
import { useLibrary } from '@/Contexts/libraryContext'
import { isFollowing , toggleIsFollowing } from '@/app/(protected)/actions/userActions'
import { useRouter } from 'next/navigation'
import { useSpotifyToast } from '@/Contexts/SpotifyToastContext'
import { useUser } from '@/Contexts/userContex'
const Followbutton = ({followObject , onUpdate}) => {
    // const router = useRouter()
    const toast = useSpotifyToast()
    const {fetchCurrentUserProfile} = useUser()
 const {fetchLibrary} = useLibrary();
 const [pending , startTransition] = useTransition();
  const [isCurrentUserFollowingIt, setIsCurrentUserFollowingIt] = useState(null)
 
  useEffect(() => {
    startTransition(async ()=>{
        const res = await isFollowing(followObject);
        setIsCurrentUserFollowingIt(res);
    })
  }, [followObject])
  
  
  return (
    <button
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          try {

            await toggleIsFollowing(followObject);
            const res = await isFollowing(followObject);
            setIsCurrentUserFollowingIt(res);
            fetchLibrary()
            fetchCurrentUserProfile()
            if(res == true){
            if(followObject.targetType == "Artist"){
              toast({text : "Added to Your Library"})
            }
          }else if (res == false){
            if(followObject.targetType == "Artist"){
              toast({text : "Removed from Your Library"})
            }
          }
          if (onUpdate) onUpdate();
        } catch (error) {
          toast({
            text: `Error: ${error?.message || "Failed to Follow"}`,
          });
        }
        });
      }}
      className={`
        p-0.5 rounded-full
        px-3
        border-2 border-white/50
        bg-transparent
        text-white
        text-sm
        font-semibold
        transition-all duration-200
      
    
        ${pending ? "cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {isCurrentUserFollowingIt ? "Following" : "Follow"}
    </button>
  )
}

export default Followbutton