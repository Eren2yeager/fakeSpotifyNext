import React,{useState ,useRef ,useEffect} from 'react'
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";

const ListRender = (props) => {

  
  const {activeItem, setActiveItem} = props.activeItem;
   const navItems = props.listItems || ["item1", "item2", "item3"];
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
          parentRef.current.clientWidth + 5
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
    <div className=' overflow-hidden flex items-center' ref={parentRef} onScroll={handleScroll}>
                <div
            className={`  hidden sm:block bg-zinc-700 p-1  rounded-full absolute  cursor-pointer left-0  z-100 opacity-90 ${
              showLeftArrow == false ? `invisible` : "visible"
            } hover:bg-zinc-900`}
            onClick={() => scroll("left")}
          >
            <MdOutlineKeyboardArrowLeft className="text-xl" />
          </div>

       <ul className={props.className}>
         {navItems.map((item, index) => (
           <li
           key={index}
             className={`px-4 py-1  cursor-pointer font-medium   transition-all duration-300 rounded-full 
             ${
               activeItem === index
               ? "bg-white text-black"
               : " bg-white/5 text-white "
             }`}
             onClick={() =>{ setActiveItem(index);console.log(activeItem);}} // Update active on click
           >
             {item}
           </li>
         ))}
       </ul>
       <div
            className={`  hidden sm:block bg-zinc-700 p-1  rounded-full cursor-pointer absolute   right-0  z-100 opacity-90 ${
              showRightArrow == false ? `invisible` : "visible"
            } hover:bg-zinc-900`}
            onClick={() => scroll("right")}
          >
            <MdOutlineKeyboardArrowRight className="text-xl" />
          </div>
 
            </div>
   )
}

export default React.memo(ListRender)
