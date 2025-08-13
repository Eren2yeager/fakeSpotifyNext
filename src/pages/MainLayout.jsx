"use client";
import { useState, useContext, useRef, useEffect, memo } from "react";
import dynamic from "next/dynamic";

// Dynamically import components that use browser-only APIs or may break on prerender
const ImagePreviewer = dynamic(() => import("@/Components/Helper/ImagePreviewer.jsx"), { ssr: false });
const Navbar = dynamic(() => import("@/Components/navbar"), { ssr: false });
const Right = dynamic(() => import("@/Components/right"), { ssr: false });
const BigLeft = dynamic(() => import("@/Components/left/bigLeft"), { ssr: false });
const SmallLeft = dynamic(() => import("@/Components/left/smallLeft"), { ssr: false });
const BigEndbar = dynamic(() => import("@/Components/endbars/bigEndbar"), { ssr: false });
const SmallEndbar = dynamic(() => import("@/Components/endbars/smallEndbar"), { ssr: false });
const AudioComponent = dynamic(() => import("@/Components/audioComponents/AudioComponent"), { ssr: false });

import { useWidthObserver } from "@/Components/Helper/WidthObserver";

import {
  ToggleFullScreenContext,
  showRightContext,
  showPlaylistsContext,
  middleWidthContext,
} from "@/Contexts/contexts.js";

function MainLayout({ children }) {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
  }, []);

  const ContextShowRight = useContext(showRightContext);
  const ContextShowPlaylists = useContext(showPlaylistsContext);
  const ContextFullScreen = useContext(ToggleFullScreenContext);
  const Context_middle_width = useContext(middleWidthContext);

  const ref = useWidthObserver(Context_middle_width?.setMiddleWidth);

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
          ContextShowPlaylists?.setShowPlaylists(false);
        } else {
          ContextShowPlaylists?.setShowPlaylists(true);
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
          {!ContextFullScreen?.toggleFullScreen && (
            <>
              <div className="sm:flex  hidden sm:block transition-all duration-300 justify-self-start ">
                {ContextShowPlaylists?.showPlaylists ? (
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
          {!ContextFullScreen?.toggleFullScreen && (
            <div
              data-resizer-name="left"
              ref={resizerRef}
              onMouseDown={startResizing}
              className="hidden sm:block  right-0 top-0 w-1  cursor-col-resize active:cursor-grab my-2  hover:bg-white"
            ></div>
          )}

          <div
            className={`w-[100%] overflow-hidden ${
              ContextFullScreen?.toggleFullScreen
                ? `hidden transition-all duration -1`
                : ``
            } `}
          >
            <div
              className={`wrapper middle  w-[100%]  h-[100%] rounded-xl  bg-zinc-900  relative transition-all duration-500 `}
              ref={ref}
            >
              {/* outlet */}
              {children}
              {/* Remove console.log to avoid issues in build */}
            </div>
          </div>

          {!ContextFullScreen?.toggleFullScreen &&
            ContextShowRight?.showRight && (
              <div
                data-resizer-name="right"
                ref={resizerRef}
                onMouseDown={startResizing}
                className="hidden sm:block  right-0 top-0 w-1 cursor-col-resize active:cursor-grab my-2  hover:bg-white"
              ></div>
            )}
          {ContextShowRight?.showRight && (
            <div
              className={`${
                ContextFullScreen?.toggleFullScreen
                  ? "w-[100%] block"
                  : "w-[300px] hidden"
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
