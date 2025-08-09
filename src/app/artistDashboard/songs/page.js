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
import AddSongPopup from "@/Components/ArtistdashboardComponents/AddSongPopUp";
import { SongCardArtist } from "@/Components/ArtistdashboardComponents/artistDashboardHelpers";
import dateFormatter from "@/functions/dateFormatter";
import NotFound from "@/Components/Helper/not-found";
import ArtistSongThreeDots from "@/Components/ArtistdashboardComponents/artistSongThreeDots";
const page = () => {
  const [isUpdated, setIsUpdated] = useState(false)

  const [pending, startTransition] = useTransition();
  const [songs, setSongs] = useState(null);

  const fetchSongs = async () => {
    const res = await fetch("/api/artistDashboard/songs");
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setSongs(data);
    console.log("Fetched artist:");
  };
  useEffect(() => {
    setIsUpdated(false)
    startTransition(async () => {
      await fetchSongs();
    });
  }, [isUpdated]);

  const [showPopup, setShowPopup] = useState(false);
  

  return (
    <>
      {pending ? (
        <div className="flex justify-center w-full  h-full items-center">
          <ThreeDotsLoader />
        </div>
      ) : (
        <>
          { (
            <AddSongPopup
              open={showPopup}
              onClose={() => {
                setShowPopup(false);
              }}
              onUpdate={()=>{setIsUpdated(true)}}
            />
          )}
          {songs?.length == 0 && (
            <NotFound
              buttonText={"Add Song"}
              buttonOnClick={() => {
                setShowPopup(true);
              }}
              buttonColor={""}
            />
          )}

          {/* Songs Tab */}
          {songs?.length > 0 && (
            <div className="space-y-6 pb-10">
              <div className="flex justify-between items-center text-white">
                <h2 className="text-2xl font-bold">Your Songs</h2>
                <Button
                  className="gap-2 p-2 bg-white/8 cursor-pointer rounded-full "
                  onClick={() => setShowPopup(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm hidden sm:block">Add Song</span>
                </Button>
              </div>

              <Card className="p-6 w-full">
                <div className="space-y-4 w-full">
                  {songs?.map((song) => (
                    <div
                      key={song._id}
                      className="flex flex-col gap-2 sm:flex-row items-center sm:justify-between p-4 rounded-lg border hover:shadow-sm transition-all w-full"
                    >
                      <div className="flex items-center space-x-4 self-start max-w-full flex-1 min-w-0">
                        {/* <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Play className="h-4 w-4" />
                        </Button> */}
                        <div className="min-w-16 min-h-16 max-w-16 max-h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {song.image ? (
                            <img
                              src={song.image}
                              alt={song.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h4 className="font-semibold truncate" title={song.name}>
                            {song.name}
                          </h4>
                          <p
                            className="text-sm text-muted-foreground truncate"
                            title={`${song.genre} • ${song.duration}`}
                          >
                            {song.genre} • {song.duration}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 self-end sm:self-auto flex-shrink-0">
                        <div className="text-right">
                          <p
                            className="text-sm font-medium truncate max-w-[120px] sm:max-w-[180px] md:max-w-[240px] lg:max-w-[320px]"
                            title={song.album ? song.album.name : "Single"}
                          >
                            {song.album ? song.album.name : "Single"}
                          </p>
                          <p className="text-xs text-nowrap text-muted-foreground">
                            {dateFormatter(song.createdAt)}
                          </p>
                        </div>
                        <Badge variant={song.album ? "default" : "secondary"}>
                          {song.album ? "Album" : "Single"}
                        </Badge>
                        <ArtistSongThreeDots song={song} onUpdate={()=>{setIsUpdated(true)}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </>
  );
}
export default page;
