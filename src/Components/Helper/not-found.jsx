import React from "react";
import { useRouter } from "next/navigation";

const NotFound = ({
  text,
  icon,
  buttonText,
  buttonOnClick,
  position,
  buttonColor,
}) => {
  const router = useRouter();

  // Use flex-1 to allow the div to fill available space, and absolute centering for true centering
  // If you want to center in viewport, use min-h-screen; if in parent, use h-full/min-h-full
  // We'll use min-h-[200px] as a fallback for small containers
  let justifyClass = "justify-center";
  if (position === "top") justifyClass = "justify-start";
  if (position === "center") justifyClass = "justify-center";

  return (
    <div
      className={`w-full h-full min-h-[200px] flex flex-col ${justifyClass} items-cen ter`}
      style={{
        minHeight: "200px",
        height: "100%",
        width: "100%",
        // If you want to always center in viewport, uncomment below:
        // position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      }}
    >
      <div className="flex flex-col items-center">
        {icon}
        {text && <p className="font-bold font-sans mt-2">{text}</p>}
        {buttonText && (
          <button
            className={`px-3 py-2 rounded-full bg-green-500 text-sm sm:text-md font-bold m-4 cursor-pointer ${
              buttonColor === "white" ? "text-black" : ""
            }`}
            style={{ backgroundColor: buttonColor }}
            onClick={buttonOnClick}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div> 
  );
};

export default React.memo(NotFound);
