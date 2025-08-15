"use client";
import { useState } from "react";

// Dynamically import icons to avoid Next.js build issues with react-icons
const FaMusic = dynamic(() =>
  import("react-icons/fa").then((mod) => mod.FaMusic), { ssr: false }
);
const FaPlus = dynamic(() =>
  import("react-icons/fa").then((mod) => mod.FaPlus), { ssr: false }
);
const FaCompactDisc = dynamic(() =>
  import("react-icons/fa").then((mod) => mod.FaCompactDisc), { ssr: false }
);
const FaAngleDoubleLeft = dynamic(() =>
  import("react-icons/fa").then((mod) => mod.FaAngleDoubleLeft), { ssr: false }
);
const FaAngleDoubleRight = dynamic(() =>
  import("react-icons/fa").then((mod) => mod.FaAngleDoubleRight), { ssr: false }
);

export default function ArtistSidebar({ active, setActive }) {
  const [collapsed, setCollapsed] = useState(false);

  // Use state to store icons after dynamic import resolves
  const [icons, setIcons] = useState({
    FaMusic: null,
    FaPlus: null,
    FaCompactDisc: null,
    FaAngleDoubleLeft: null,
    FaAngleDoubleRight: null,
  });

  // Load icons on mount
  useState(() => {
    let mounted = true;
    Promise.all([
      import("react-icons/fa").then((mod) => mod.FaMusic),
      import("react-icons/fa").then((mod) => mod.FaPlus),
      import("react-icons/fa").then((mod) => mod.FaCompactDisc),
      import("react-icons/fa").then((mod) => mod.FaAngleDoubleLeft),
      import("react-icons/fa").then((mod) => mod.FaAngleDoubleRight),
    ]).then(
      ([
        FaMusicIcon,
        FaPlusIcon,
        FaCompactDiscIcon,
        FaAngleDoubleLeftIcon,
        FaAngleDoubleRightIcon,
      ]) => {
        if (mounted) {
          setIcons({
            FaMusic: FaMusicIcon,
            FaPlus: FaPlusIcon,
            FaCompactDisc: FaCompactDiscIcon,
            FaAngleDoubleLeft: FaAngleDoubleLeftIcon,
            FaAngleDoubleRight: FaAngleDoubleRightIcon,
          });
        }
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  const menu = [
    { name: "Add Song", icon: icons.FaMusic, key: "add-song" },
    { name: "Add Album", icon: icons.FaCompactDisc, key: "add-album" },
    { name: "My Songs", icon: icons.FaPlus, key: "my-songs" },
    { name: "My Albums", icon: icons.FaPlus, key: "my-albums" },
  ];

  return (
    <aside
      className={`h-screen bg-neutral-800 text-white transition-all duration-300 ${
        collapsed ? "w-[70px]" : "w-64"
      } p-3 shadow-md flex flex-col`}
    >
      {/* Collapse button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white text-xl hover:text-emerald-400 transition"
        >
          {collapsed
            ? icons.FaAngleDoubleRight && <icons.FaAngleDoubleRight />
            : icons.FaAngleDoubleLeft && <icons.FaAngleDoubleLeft />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-3">
        {menu.map((item) => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={`flex items-center gap-4 px-4 py-2 rounded-lg transition ${
              active === item.key
                ? "bg-emerald-600"
                : "hover:bg-neutral-800"
            }`}
            disabled={!item.icon}
          >
            <span className="text-lg">
              {item.icon && <item.icon />}
            </span>
            {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}
