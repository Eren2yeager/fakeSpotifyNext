"use client";
import React, { useState, useEffect } from "react";
import { useTransition } from "react";
import ThreeDotsLoader from "@/Components/Helper/ThreeDotsLoader";
import {
  Plus,
  Play,
  MoreHorizontal,
  Music,
  Disc,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  StatsCards,
  Button,
  Badge,
} from "@/Components/ArtistdashboardComponents/artistDashboardHelpers";
import AddAlbumPopup from "@/Components/ArtistdashboardComponents/AddAlbumPopup";
import dateFormatter from "@/functions/dateFormatter";
import NotFound from "@/Components/Helper/not-found";

import ArtistAlbumThreeDots from "@/Components/ArtistdashboardComponents/artistAlbumThreeDots";

import { useRouter } from "next/navigation";
const page = () => {
  const [albums, setAlbums] = useState(null);
  const [pending, startTransition] = useTransition();
  const [isUpdated, setIsUpdated] = useState(false)
  const router = useRouter()
  const fetchAlbums = async () => {
    const res = await fetch("/api/artistDashboard/albums");
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setAlbums(data);
    console.log("Fetched albums:");
  };
  useEffect(() => {
    setIsUpdated(false)
    startTransition(async () => {
      await fetchAlbums();
    });
  }, [isUpdated]);

  const [open, setOpen] = useState(false);

  return (
    <>
      {pending ? (
        <div className="flex justify-center w-full h-full items-center">
          <ThreeDotsLoader />
        </div>
      ) : (
        <>
          {open && (
            <AddAlbumPopup
              open={open}
              onClose={() => {
                setOpen(false);
              }}
              onUpdate={(()=>{setIsUpdated(true)})}
            />
          )}

          {albums && albums.length === 0 && (
            <NotFound
              buttonText={"Create Album"}
              buttonOnClick={() => {
                setOpen(true);
              }}
              buttonColor={""}
            />
          )}

          {albums && albums.length > 0 && (
            <div className="space-y-6 pb-10">
              <div className="flex justify-between items-center text-white">
                <h2 className="text-2xl font-bold">Your Albums</h2>
                <Button
                  className="gap-2 p-2 bg-white/8 rounded-full"
                  onClick={() => {
                    setOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm hidden sm:block">Create Album</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {albums.map((album) => (
                  <Card
                    key={album._id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      router.push(`/artistDashboard/albums/${album._id}`);
                    }}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={album.image}
                        alt={album.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="py-2">
                      <div className="flex justify-between items-center">
                        <h3
                          className="font-bold mb-1 truncate text-lg"
                          title={album.name}
                        >
                          {album.name}
                        </h3>
                        <ArtistAlbumThreeDots album={album} onUpdate={()=>{setIsUpdated(true)}}/>
                      </div>

                      <p
                        className="text-md text-muted-foreground mb-2 truncate text-white/80"
                        title={`${album.songs.length} songs`}
                      >
                        {album.songs.length} songs
                      </p>
                      <p
                        className="text-xs text-muted-foreground truncate text-white/45"
                        title={dateFormatter(album.createdAt)}
                      >
                        {dateFormatter(album.createdAt)}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default page;
