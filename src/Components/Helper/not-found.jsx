import React ,{useContext} from "react";
import { useNavigate } from "react-router-dom";
import { useRouter } from "next/navigation";
import { ToggleFullScreenContext} from "@/Contexts/contexts";

const NotFound = () => {
  const router = useRouter();
  const Context_toggle_FullScreen = useContext(ToggleFullScreenContext);

  return (
    <div className="min-w-[100%] min-h-[100%] h-screen flex flex-col justify-center items-center"
    onClick={() => {
      router.push("/search");
      Context_toggle_FullScreen.settoggleFullScreen(false)
    }}>
      <lord-icon
        src="https://cdn.lordicon.com/zxaptliv.json"
        trigger="loop"
        delay="3000"
        stroke="bold"
        colors="primary:#ffffff,secondary:#30e849"
        style={{ width: "200px", height: "200px" }}
      ></lord-icon>
      <p className="font-extrabold font-sans">Find SomeThing to Play</p>
      <button
        className="px-3 py-2 rounded-full bg-green-500 font-extrabold m-4 cursor-pointer"
        onClick={() => {
          router.push("/search");
          Context_toggle_FullScreen.settoggleFullScreen(false)
        }}
      >
        Search
      </button>
    </div>
  );
};

export default NotFound;
