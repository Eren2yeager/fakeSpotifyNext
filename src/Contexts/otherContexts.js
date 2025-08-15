import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
const otherContexts = createContext();

export const useOtherContexts = () => useContext(otherContexts);

/* ------------------------------
  Provider Component
------------------------------ */
export function OtherContextsProvider({ children }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [showRight, setShowRight] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [imagefullViewSrc, setImagefullViewSrc] = useState(null);
  const [middleWidth, setMiddleWidth] = useState(0);
  const [searchedText, setSearchedText] = useState("");

  // toggleFullScreen state is synced with the "toggleFullScreen" query param in the URL
  const [toggleFullScreen, setToggleFullScreenState] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const toggleFullScreenQuery = params.get("toggleFullScreen");
      setToggleFullScreenState(toggleFullScreenQuery === "true");
    }
  }, [searchParams]); // re-run when router changes (URL changes)

  // When you want to update toggleFullScreen, update the URL (which will update state via useEffect)
  const setToggleFullScreen = (value) => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("toggleFullScreen", value ? "true" : "false");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      router.push(newUrl, { scroll: false });
      setToggleFullScreenState(value);
    }
  };

  return (
    <otherContexts.Provider
      value={{
        toggleFullScreen,
        setToggleFullScreen,
        showRight,
        setShowRight,
        showLibrary,
        setShowLibrary,
        imagefullViewSrc,
        setImagefullViewSrc,
        middleWidth,
        setMiddleWidth,
        searchedText,
        setSearchedText,
      }}
    >
      {children}
    </otherContexts.Provider>
  );
}
