"use client";
import React, { useState, useEffect } from "react";
import { useTransition } from "react";
import ThreeDotsLoader from "@/Components/Helper/ThreeDotsLoader";
import { Plus, Music } from "lucide-react";

import {
  Card,
  Button,
  Badge,
} from "@/Components/ArtistdashboardComponents/artistDashboardHelpers";
import ArtistSongRow from "@/Components/ArtistdashboardComponents/ArtistSongRow";
import AddSongPopup from "@/Components/ArtistdashboardComponents/AddSongPopUp";
import dateFormatter from "@/functions/dateFormatter";
import NotFound from "@/Components/Helper/not-found";
import ArtistSongThreeDots from "@/Components/ArtistdashboardComponents/artistSongThreeDots";

const page = () => {
  const [isUpdated, setIsUpdated] = useState(false);

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
    setIsUpdated(false);
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
          {showPopup && (
            <AddSongPopup
              open={showPopup}
              onClose={() => {
                setShowPopup(false);
              }}
              onUpdate={() => {
                setIsUpdated(true);
              }}
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
                    <ArtistSongRow key={song._id} song={song}>
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
                      <ArtistSongThreeDots
                        song={song}
                        onUpdate={() => {
                          setIsUpdated(true);
                        }}
                      />
                    </ArtistSongRow>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default page;
