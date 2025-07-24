import React, { useContext } from "react";
import { useRouter } from "next/navigation";

const NotFound = ({ text, icon, buttonText, buttonOnClick ,position , buttonColor}) => {
  const router = useRouter();

  return (
    <div className={`min-w-[100%] min-h-[100%]  flex flex-col ${position =="top" ? "justify-start items-center" : position =="center" ? "justify-center items-center" : "justify-center items-center"} `}>
      {icon}
      {text && <p className="font-extrabold font-sans">{text}</p>}
      {buttonText && (
        <button
          className={`px-3 py-2 rounded-full bg-green-500 font-extrabold m-4 cursor-pointer`}
          style={{backgroundColor : buttonColor}}
          onClick={
            buttonOnClick
          }
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default React.memo(NotFound);
