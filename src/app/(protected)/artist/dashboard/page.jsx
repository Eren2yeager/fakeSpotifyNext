"use client";
import { useState } from "react";
import ArtistSidebar from "@/Components/ArtistdashboardComponents/ArtistSidebar";
import AddSong from "@/Components/ArtistdashboardComponents/AddSong";
import AddAlbum from "@/Components/ArtistdashboardComponents/AddAlbum";

export default function ArtistDashboard() {
  const [active, setActive] = useState("add-song");

  return (
    <div className="flex">
      <ArtistSidebar active={active} setActive={setActive} />
      <main className="flex-1  justify-center max-h-screen overflow-y-auto">
        {active === "add-song" && <AddSong />}
        {active === "add-album" && <AddAlbum />}
        {/* other sections will go here */}
      </main>
    </div>
  );
}
