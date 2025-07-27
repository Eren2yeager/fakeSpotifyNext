import React from "react";
import ThreeDotsLoader from "./ThreeDotsLoader";
const DisabledThreeeDotsLoader = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40">
      <div className="fixed top-1/2 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-neutral-900 p-6 shadow-lg">
        <ThreeDotsLoader />
      </div>
    </div>
  );
};

export default DisabledThreeeDotsLoader;
