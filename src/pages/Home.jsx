"use client"
import React,{ useState, useContext ,useEffect ,useRef} from "react";
import ThreeDotsLoader from "@/Components/Helper/ThreeDotsLoader.jsx";
import FailedToFetch from "@/Components/Helper/failedToFetch.jsx";
import ListRender from "@/Components/Helper/listRender.jsx";
import HorizentalItemsList from "@/Components/horizentalLists/horizentalItemsList.jsx";
import GridCellContainer from "@/Components/Helper/gridCellContainer.jsx";

function Home() {
  const [Loading, setLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [homeJson, setHomeJson] = useState(null)

  const [activeItem, setActiveItem] = useState(0)
  const listItems=["All", "Music", "Podcasts"]

  useEffect(async () => {
    setLoading(true)
    await fetch("http://localhost:5000/api/songs")
     .then(res => {
       if (!res.ok) {
         throw new Error("Failed to fetch playlists");
       }
       return res.json();
     })
     .then(data => {
      setHomeJson(data);
     })
     .catch(err => {
       console.error("❌ Error fetching playlists:", err);
       setIsError(true)
     })
     .finally(()=>{
      setLoading(false)
       
     })
  }, [activeItem])
    
  const middleNavRef = useRef(null);

  const handleScroll = (e) => {
    const target = e.target;
    if (target.scrollTop > 0) {
      middleNavRef.current.classList.add(
        "shadow-lg",
        "shadow-zinc-900",
        "bg-zinc-900"
      );
      middleNavRef.current.classList.remove("bg-transparent");
    } else {
      middleNavRef.current.classList.remove(
        "shadow-lg",
        "shadow-zinc-900",
        "bg-zinc-900"
      );
      middleNavRef.current.classList.add("bg-transparent");
    }
  };






  return (
    <>
      {Loading ? 
      <div className="w-[100%] h-[100%] flex items-center justify-center">

      <ThreeDotsLoader/>
      </div>
       :isError ? <div className="w-[100%] h-[100%] flex items-center justify-center"><FailedToFetch /></div>: 
       
       
       
       <>
    
    <div className="w-[100%] h-[100%] justify-center items-center">
      <div
        className=" h-[60px]  overflow-x-auto overflow-y-hidden  bg-transparent rounded-t-xl transition-all duration-500 sticky top-0"
        ref={middleNavRef}
        >
        <ListRender
          listItems={listItems}
          className="flex gap-3 px-5  h-full p-3  sticky top-0 z-30"
          activeItem={{activeItem, setActiveItem}}
          />
      </div>

      {/*for horizental lst  */}
       

      <div
        className="middle-scroll-div min-w-[100%] flex flex-col gap-5 h-[95%]  pb-40 sm:pb-5 overflow-y-auto"
        onScroll={handleScroll}
        > 
        <GridCellContainer />
        {/* mapping of home data */}

        
        {homeJson?.length >0 && homeJson.map((item, index) => {
          return(
            <div key={index}>
            <HorizentalItemsList
            heading={"Recemonded!"}
            listItems={homeJson}
            />
            </div>
          )
          
        })}


      </div>
    </div>
        </>
      
    }
    </>
  );
}

export default Home;
