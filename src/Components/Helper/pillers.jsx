
import React, { useContext } from "react";
import { usePlayer } from "@/Contexts/playerContext";
const Pillers = () => {
    const { isPlaying } = usePlayer();

    let barCount = 5;
    if(window.innerWidth <= 640){
      barCount = 3;
    }
  
    return (
      <div className="flex items-end  gap-[1px] h-3 max-w-10 overflow-hidden ">
        {Array(barCount)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="w-[3px] bg-green-600  origin-bottom transition-all duration-300"
              style={{
                height: isPlaying ? "" : "20%",
                animation: isPlaying
                  ? `spotifybounce 0.8s ease-in-out ${i * 0.15}s infinite`
                  : "none",
              }}
            />
          ))}
      </div>
    );
  };

export default React.memo(Pillers);




