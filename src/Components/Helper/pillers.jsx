// import React, { useContext, useRef, useEffect } from "react";
// import { isPlayingContext } from "../../Contexts/contexts";

// const Pillers = () => {
//   const Context_isPlaying = useContext(isPlayingContext);
//   const pillerRef = useRef(null);

//   useEffect(() => {
   
//    if( !pillerRef.current) return
 
//     let interval;
//     function start() {
//       interval = setInterval(() => {
//         pillerRef.current.style.height =
//           10 + Math.floor(Math.random() * 90) + "%";
//       }, 500);
//     }

//     function stop() {
//       clearInterval(interval);
//       pillerRef.current.style.height = 10 + "%";
//     }

//     if (Context_isPlaying.isPlaying) {
//       start();
//     } else {
//       stop();
//     }
//   }, []);

//   return (
//     <div className="w-[30px] h-[30px] flex justify-center items-end gap-1">
//       <p
//         className="piller bg-green-500 w-1.5 transition-all duration-500"
//         ref={pillerRef}
//       ></p>
//       <p
//         className="piller bg-green-500 w-1.5 transition-all duration-500"
//         ref={pillerRef}
//       ></p>
//       <p
//         className="piller bg-green-500 w-1.5 transition-all duration-500"
//       ></p>
//     </div>
//   );
// };

// export default Pillers;

// import React, { useContext } from "react";
// import { isPlayingContext } from "../../Contexts/contexts";

// const Pillers = () => {
//   const { isPlaying } = useContext(isPlayingContext);

//   return (
//     <div className="flex items-end gap-[3px] h-[24px] w-[20px]">
//       {[0.8, 1, 0.6, 0.9].map((scale, i) => (
//         <div
//           key={i}
//           className={`w-[3px] h-full rounded-sm bg-green-400 origin-bottom transition-all duration-300 ${
//             isPlaying ? "animate-[bounce_0.8s_ease-in-out_infinite]" : ""
//           }`}
//           style={{
//             animationDelay: `${i * 0.2}s`,
//             transform: `scaleY(${scale})`,
//           }}
//         ></div>
//       ))}
//     </div>
//   );
// };

// export default Pillers;

import React, { useContext } from "react";
import { isPlayingContext } from "../../Contexts/contexts";

const Pillers = () => {
    const { isPlaying } = useContext(isPlayingContext);

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




