import React, { useState, useRef, useEffect } from "react";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";

const ListRender = ({ activeItem, setActiveItem, listItems, className }) => {
  const navItems = listItems || ["item1", "item2", "item3"];
  // for horzental scrolling effect without user scroll
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const parentRef = useRef(null);

  const checkOverflow = () => {
    if (!parentRef.current) return;
    setShowLeftArrow(parentRef.current.scrollLeft > 0);
    setShowRightArrow(
      parentRef.current.scrollWidth - parentRef.current.scrollLeft >
        parentRef.current.clientWidth + 5
    );
  };

  useEffect(() => {
    const observer = new ResizeObserver(checkOverflow);
    if (parentRef.current) observer.observe(parentRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // for horzental scrolling effect with user scroll

  const handleScroll = (e) => {
    setTimeout(() => {
      setShowLeftArrow(parentRef.current.scrollLeft > 0);
      setShowRightArrow(
        parentRef.current.scrollWidth - parentRef.current.scrollLeft >
          parentRef.current.clientWidth + 2
      );
    }, 200);
  };

  // to scroll left and right
  const scroll = (direction) => {
    const { current } = parentRef;
    if (current) {
      const scrollAmount = 100; // Adjust the scroll amount as needed
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <div
      className="overflow-x-auto inset-0 overflow-y-hidden flex items-center scrollbar-hide  "
      style={{
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE 10+
      }}
      ref={parentRef}
      onScroll={handleScroll}
      // Hide scrollbar for Webkit browsers
      // (This is safe in Next.js app router, and can be combined with Tailwind if you have a plugin)
    >
      <style jsx>{`
        div.scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        className={`  hidden sm:block p-1  rounded-full cursor-pointer absolute   left-0  z-2  ${
          showLeftArrow == false ? `invisible` : "visible"
        } bg-zinc-900`}
        onClick={() => scroll("left")}
      >
        <MdOutlineKeyboardArrowLeft className="text-md " />
      </div>

      <ul className={`relative z-1 ${className}`}>
        {navItems.map((item, index) => (
          <li
            key={index}
            className={`px-4 py-1 text-xs sm:text-sm cursor-pointer font-medium   transition-all duration-300 rounded-full 
             ${
               activeItem === index
                 ? "bg-white text-black"
                 : " bg-white/5 text-white "
             }`}
            onClick={() => {
              setActiveItem(index);
            }} // Update active on click
          >
            {item}
          </li>
        ))}
      </ul>
      <div
        className={`  hidden sm:block  p-1  rounded-full cursor-pointer absolute   right-0  z-1  ${
          showRightArrow == false ? `invisible` : "visible"
        } bg-zinc-900`}
        onClick={() => scroll("right")}
      >
        <MdOutlineKeyboardArrowRight className="text-md" />
      </div>
    </div>
  );
};

export default React.memo(ListRender);
