"use client";
import { useState, useEffect, useRef } from "react";
import {
  Plus,
  // Remove unused icons to avoid build issues
  // Play,
  // MoreHorizontal,
  // Music,
  // Disc,
  // Users,
  // TrendingUp,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/Components/ArtistdashboardComponents/artistDashboardHelpers";
import dynamic from "next/dynamic";

// Dynamically import CreateNewPopup to avoid SSR issues
const CreateNewPopup = dynamic(
  () => import("@/Components/ArtistdashboardComponents/CreateNewPopup"),
  { ssr: false }
);

const ArtistDashboardLayout = ({ children }) => {
  const [isUpdated, setIsUpdated] = useState(false);

  // Remove unused state to avoid build warnings
  // const [activeTab, setActiveTab] = useState("overview");
  const usepathname = usePathname();
  const router = useRouter();

  const [showCreateNewPopup, setShowCreateNewPopup] = useState(false);
  const [anchor, setAnchor] = useState(null);

  // Use a ref to avoid calling getBoundingClientRect on server
  const buttonRef = useRef(null);

  useEffect(() => {
    setIsUpdated(false);
  }, [isUpdated]);

  // Defensive: Only call getBoundingClientRect in browser
  const handleCreateNewClick = (e) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && buttonRef.current) {
      setAnchor(buttonRef.current.getBoundingClientRect());
    } else {
      setAnchor(null);
    }
    setShowCreateNewPopup(true);
  };

  return (
    <>
      {/* create new popup  */}
      {showCreateNewPopup && (
        <CreateNewPopup
          open={showCreateNewPopup}
          onClose={() => {
            setShowCreateNewPopup(false);
          }}
          anchorRect={anchor}
          onUpdate={() => {
            setIsUpdated(true);
          }}
        />
      )}

      {/* Header */}
      <header className=" bg-background/95 backdrop-blur  sticky top-0 z-50 text-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white bg-clip-text ">
              Artist <span className="text-green-500">&lt;/Studio&gt;</span>
            </h1>
          </div>
          <div
            className=""
            ref={buttonRef}
            onClick={handleCreateNewClick}
          >
            <Button className="gap-2 bg-white/8 p-2 cursor-pointer rounded-full  ">
              <Plus className="h-4 w-4 " />
              <span className="hidden sm:block">Create New</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 w-full  h-full">
        {/* Navigation Tabs */}
        <div className="flex space-x-1  p-1 rounded-lg mb-6 w-fit ">
          {["overview", "songs", "albums", "analytics"].map((tab) => (
            <button
              key={tab}
              onClick={() => router.push(`/artistDashboard/${tab}`)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer  ${
                usepathname && usepathname.includes(`/artistDashboard/${tab}`)
                  ? "bg-white text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground bg-white/8 text-white"
              }`}
              type="button"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {children}

        {/* Analytics Tab */}
      </div>
    </>
  );
};

export default ArtistDashboardLayout;
