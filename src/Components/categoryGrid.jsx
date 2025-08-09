import React, {useContext} from "react";
import { middleWidthContext } from "@/Contexts/contexts";
const CategoryCard = ({ title, image, bgColor }) => {
    return (
      <div
        className={`relative rounded-lg overflow-hidden max-w-[270px] min-h-[100px] h-[150px] p-4 cursor-pointer hover:scale-105 transition-transform duration-200`}
        style={{ backgroundColor: bgColor }}
      >
        <h3 className="text-white font-bold text-lg relative z-1">{title}</h3>
        <img
          src={image}
          alt={title}
          className="max-w-25 max-h-25  z-0 absolute bottom-0 right-0 rotate-[25deg] translate-x-2 translate-y-2 shadow-2xs  shadow-black rounded-sm"
        />
      </div>
    );
  };
  
const categories = [
  { title: "Music", image: "/images/nextPhonk.jpg", bgColor: "#e13300" },
  { title: "Podcasts", image: "/images/notfound.png", bgColor: "#1e3264" },
  { title: "Live Events", image: "/images/notfound.png", bgColor: "#8c1932" },
  { title: "Made For You", image: "/images/notfound.png", bgColor: "#283ea8" },
  { title: "New Releases", image: "/images/notfound.png", bgColor: "#b49bc8" },
  { title: "Rain & Monsoon", image: "/images/notfound.png", bgColor: "#15754a" },
  { title: "Hindi", image: "/images/notfound.png", bgColor: "#dc148c" },
  { title: "Telugu", image: "/images/notfound.png", bgColor: "#e36414" },
  { title: "Punjabi", image: "/images/notfound.png", bgColor: "#b49bc8" },
];

const CategoryGrid = () => {
  const Context_middle_width = useContext(middleWidthContext);
  const { middleWidth } = Context_middle_width;

  return (
    <div className=" sm:p-6 space-y-8 h-[100%] text-white z-10">
        <h2 className="text-2xl font-bold mb-4">Start browsing</h2>
        <div className="grid grid-cols-2  sm:grid-cols-[repeat(auto-fit,minmax(250px,max-content))] gap-4">
          {categories.slice(0, 3).map((cat, idx) => ( 
            <CategoryCard key={idx} {...cat} />
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-4">Browse all</h2>
        <div className="grid grid-cols-2  sm:grid-cols-[repeat(auto-fit,minmax(250px,min-content))]  gap-4">
          {categories.slice(3).map((cat, idx) => (
            <CategoryCard key={idx} {...cat} />
          ))}
        </div>
      </div>
  );
};

export default React.memo(CategoryGrid);
