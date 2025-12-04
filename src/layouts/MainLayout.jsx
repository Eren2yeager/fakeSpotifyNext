"use client";
import { useState, useContext, useRef, useEffect, memo } from "react";

// Only use dynamic imports for components that actually need client-side only rendering
import AudioComponent from "@/Components/audioComponents/AudioComponent";
import ImagePreviewer from "@/Components/Helper/ImagePreviewer";
// Import these components dynamically since they use session/context hooks
import Navbar from "@/Components/navbar";
import Right from "@/Components/right";
import BigLeft from "@/Components/left/bigLeft";
import SmallLeft from "@/Components/left/smallLeft";
import BigEndbar from "@/Components/endbars/bigEndbar";
import SmallEndbar from "@/Components/endbars/smallEndbar";

import { useWidthObserver } from "@/Components/Helper/WidthObserver";
import { useOtherContexts } from "@/Contexts/otherContexts";

function MainLayout({ children }) {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
  }, []);

  // console.log(renderCount.current)

  // Add safety check for context to prevent SSR errors
  const contextValue = useOtherContexts();
  const {
    toggleFullScreen = false,
    setToggleFullScreen = () => {},
    showRight = true,
    setShowRight = () => {},
    showLibrary = false,
    setShowLibrary = () => {},
    middleWidth = 0,
    setMiddleWidth = () => {},
  } = contextValue || {};

  const ref = useWidthObserver(setMiddleWidth);

  // for resizing
  const [rightWidth, setRightWidth] = useState(300);
  const [leftWidth, setLeftWidth] = useState(300);
  const resizerRef = useRef(null);

  const startResizing = (e) => {
    if (typeof window === "undefined") return; // Prevent running on server

    const target = e.target.getAttribute("data-resizer-name");
    const startX = e.clientX;

    let subject = null;
    let setSubject = null;
    if (target === "right") {
      subject = rightWidth;
      setSubject = (value) => {
        setRightWidth(value);
      };
    } else if (target === "left") {
      subject = leftWidth;
      setSubject = (value) => {
        setLeftWidth(value);
      };
    }
    let startWidth = subject;

    const onMouseMove = (e) => {
      let newWidth;
      if (target === "right") {
        newWidth = startWidth + (startX - e.clientX);
        setSubject(Math.min(400, Math.max(240, newWidth)));
      } else {
        newWidth = startWidth + (e.clientX - startX);
        setSubject(Math.min(350, Math.max(240, newWidth)));

        if (leftWidth <= 240) {
          setShowLibrary(false);
        } else {
          setShowLibrary(true);
        }
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const [activeitemForleft, setActiveitemForleft] = useState(0);

  return (
    <>
      <section className="select-none w-[100%] h-[100%] flex flex-col items-center justify-between relative font-sans bg-black overflow-hidden">
        <div className="w-[100%] hidden sm:block">
          <Navbar />
        </div>

        <main className="w-[100%] h-[100%]  flex  text-white   gap-0.5 p-1.5  relative overflow-hidden transition-all duration-500 ">
          {!toggleFullScreen && (
            <>
              <div className="sm:flex  hidden sm:block transition-all duration-300 justify-self-start ">
                {showLibrary ? (
                  <div className="" style={{ width: `${leftWidth}px` }}>
                    <BigLeft
                      leftWidth={leftWidth}
                      setLeftWidth={setLeftWidth}
                      activeItem={activeitemForleft}
                      setActiveItem={setActiveitemForleft}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <SmallLeft
                      leftWidth={leftWidth}
                      setLeftWidth={setLeftWidth}
                      activeItem={activeitemForleft}
                    />
                  </div>
                )}
              </div>
            </>
          )}
          {/* resizer left */}
          {!toggleFullScreen && (
            <div
              data-resizer-name="left"
              ref={resizerRef}
              onMouseDown={startResizing}
              className="hidden sm:block  right-0 top-0 w-1  cursor-col-resize active:cursor-grab my-2  hover:bg-white"
            ></div>
          )}

          <div
            className={`w-[100%] overflow-hidden ${
              toggleFullScreen ? `hidden transition-all duration -1` : ``
            } `}
          >
            <div
              className={`wrapper middle  w-[100%]  h-[100%] sm:rounded-lg  bg-zinc-900  relative transition-all duration-500 `}
              ref={ref}
            >
              {/* outlet */}
              {children}
      
            </div>
          </div>

          {!toggleFullScreen && showRight && (
            <div
              data-resizer-name="right"
              ref={resizerRef}
              onMouseDown={startResizing}
              className="hidden sm:block  right-0 top-0 w-1 cursor-col-resize active:cursor-grab my-2  hover:bg-white"
            ></div>
          )}
          {showRight && (
            <div
              className={`${
                toggleFullScreen ? "w-[100%] block" : "w-[300px] hidden"
              } sm:block  `}
              style={{ minWidth: `${rightWidth}px` }}
            >
              <Right />
            </div>
          )}
        </main>

        <SmallEndbar className="block sm:hidden" />
        <BigEndbar className="hidden sm:block" />
        <AudioComponent />
      </section>

      {/* to view any image in full  */}

      <ImagePreviewer />
    </>
  );
}

export default memo(MainLayout);
