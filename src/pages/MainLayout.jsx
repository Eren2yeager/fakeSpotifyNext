"use client";
import { useState, useContext, useRef, useEffect , memo } from "react";
import { Outlet } from "react-router-dom";
import ImagePreviewer from "@/Components/Helper/ImagePreviewer.jsx";
import { useWidthObserver } from "@/Components/Helper/WidthObserver";

import {
  ToggleFullScreenContext,
  showRightContext,
  showPlaylistsContext,
  middleWidthContex,
} from "@/Contexts/contexts.js";

import Navbar from "@/Components/navbar";
import Right from "@/Components/right";
import BigLeft from "@/Components/left/bigLeft";
import SmallLeft from "@/Components/left/smallLeft";
import BigEndbar from "@/Components/endbars/bigEndbar";
import SmallEndbar from "@/Components/endbars/smallEndbar";
import AudioComponent from "@/Components/audioComponents/AudioComponent";

function MainLayout({ children }) {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
  });
  console.log( "render counts: ",renderCount.current);

  const ContextShowRight = useContext(showRightContext);
  const ContextShowPlaylists = useContext(showPlaylistsContext);
  const ContextFullScreen = useContext(ToggleFullScreenContext);
  const Context_middle_width = useContext(middleWidthContex);

  const ref = useWidthObserver(Context_middle_width.setMiddleWidth); // giving your own state setter

  // for resizing
  const [rightWidth, setRightWidth] = useState(300); // Initial px width
  const [leftWidth, setLeftWidth] = useState(300); // Initial px width
  const resizerRef = useRef(null);

  const startResizing = (e) => {
    const target = e.target.getAttribute("data-resizer-name");

    const startX = e.clientX;

    let subject = null;
    let setSubject = null;
    if (target == "right") {
      subject = rightWidth;
      setSubject = (value) => {
        setRightWidth(value);
      };
    } else if (target == "left") {
      subject = leftWidth;
      setSubject = (value) => {
        setLeftWidth(value);
      };
    }
    let startWidth = subject;

    const onMouseMove = (e) => {
      // to control auto close and open on width

      let newWidth;
      if (target == "right") {
        newWidth = startWidth + (startX - e.clientX);
        setSubject(Math.min(400, Math.max(240, newWidth))); // minimum 300px and max-400px
      } else {
        newWidth = startWidth + (e.clientX - startX);
        setSubject(Math.min(350, Math.max(240, newWidth))); // minimum 300px and max-400px

        leftWidth <= 240
          ? ContextShowPlaylists.setShowPlaylists(false)
          : ContextShowPlaylists.setShowPlaylists(true);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <>
      <section className="select-none w-[100%] h-[100%] flex flex-col items-center justify-between relative font-sans bg-black overflow-hidden">
        <div className="w-[100%] hidden sm:block">
          <Navbar></Navbar>
        </div>

        <main className="w-[100%] h-[100%]  flex  text-white   gap-0.5 p-1.5  relative overflow-hidden transition-all duration-500 ">
          {!ContextFullScreen.toggleFullScreen && (
            <>
              <div className="sm:flex  hidden sm:block transition-all duration-300 justify-self-start ">
                {ContextShowPlaylists.showPlaylists ? (
                  <div className="" style={{ width: `${leftWidth}px` }}>
                    <BigLeft
                      leftWidth={leftWidth}
                      setLeftWidth={setLeftWidth}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <SmallLeft
                      leftWidth={leftWidth}
                      setLeftWidth={setLeftWidth}
                    />
                  </div>
                )}
              </div>
            </>
          )}
          {/* resizer left */}
          {!ContextFullScreen.toggleFullScreen && (
            <div
              data-resizer-name="left"
              ref={resizerRef}
              onMouseDown={startResizing}
              className="hidden sm:block  right-0 top-0 w-1  cursor-col-resize my-2  hover:bg-white"
            ></div>
          )}

          <div
            className={`w-[100%] overflow-hidden ${
              ContextFullScreen.toggleFullScreen
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
              {console.log(Context_middle_width.middleWidth)}
            </div>
          </div>

          {!ContextFullScreen.toggleFullScreen &&
            ContextShowRight.showRight && (
              <div
                data-resizer-name="right"
                ref={resizerRef}
                onMouseDown={startResizing}
                className="hidden sm:block  right-0 top-0 w-1 cursor-col-resize my-2  hover:bg-white"
              ></div>
            )}
          {ContextShowRight.showRight && (
            <div
              className={`${
                ContextFullScreen.toggleFullScreen
                  ? "w-[100%] block"
                  : "w-[300px] hidden"
              } sm:block  `}
              style={{ minWidth: `${rightWidth}px` }}
            >
              <Right></Right>
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
