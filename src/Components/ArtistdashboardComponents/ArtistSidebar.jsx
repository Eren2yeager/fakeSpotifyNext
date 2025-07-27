"use client";
import { useState } from "react";
import { FaMusic, FaPlus, FaCompactDisc, FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";

export default function ArtistSidebar({ active, setActive }) {
  const [collapsed, setCollapsed] = useState(false);

  const menu = [
    { name: "Add Song", icon: <FaMusic />, key: "add-song" },
    { name: "Add Album", icon: <FaCompactDisc />, key: "add-album" },
    { name: "My Songs", icon: <FaPlus />, key: "my-songs" },
    { name: "My Albums", icon: <FaPlus />, key: "my-albums" },
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
          {collapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
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
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}
