"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Play,
  MoreHorizontal,
  Music,
  Disc,
  Users,
  TrendingUp,
} from "lucide-react";

import { Card, StatsCards, Button, Badge } from "@/Components/ArtistdashboardComponents/artistDashboardHelpers";
import ArtistSongRow from "@/Components/ArtistdashboardComponents/ArtistSongRow";
import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import ThreeDotsLoader from "@/Components/Helper/ThreeDotsLoader";
import { PiNotePencil } from "react-icons/pi";
import dateFormatter from "@/functions/dateFormatter";
import EditArtistDetailsPopup from "@/Components/ArtistdashboardComponents/EditArtistDetailsPoptup";
const ArtistOverview = () => {
  const [isUpdated, setIsUpdated] = useState(false)

  const [artist, setArtist] = useState(null);
  const [pending, startTransition] = useTransition();

  const usepathname = usePathname();
  const router = useRouter();

  const fetchArtist = async () => {
    const res = await fetch("/api/artistDashboard");
    if (!res.ok) return;
    const data = await res.json();
    setArtist(data);
  };

  useEffect(() => {
    setIsUpdated(false)
    startTransition(async () => {
      await fetchArtist();
    });
  }, [isUpdated]);

  const totalDuration = artist?.songs.reduce((total, song) => {
    const [minutes, seconds] = song.duration.split(":").map(Number);
    return total + minutes * 60 + seconds;
  }, 0);

  const formatTotalDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;
  };

  const stats = [
    {
      title: "Total Songs",
      value: artist?.songs.length,
      change: "+3 this month",
      icon: Music,
      trend: "up",
    },
    {
      title: "Albums Released",
      value: artist?.albums.length,
      change: "+1 this year",
      icon: Disc,
      trend: "up",
    },
    {
      title: "Followers",
      value: (artist?.followers.users.length + artist?.followers.artists.length),
      change: "+8.2%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Total Duration",
      value: formatTotalDuration(totalDuration),
      change: "+12m",
      icon: TrendingUp,
      trend: "up",
    },
  ];

  // for edit artist

  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      {pending ? (
        <div className="flex w-full h-full justify-center items-center">
          <ThreeDotsLoader />
        </div>
      ) : (
        artist && (
          <div className="space-y-6 pb-10">
            {/* Artist Profile Section */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div
                  className="w-32 h-32 rounded-full relative overflow-hidden shadow-lg shadow-black group"
                  onClick={() => {
                    setShowPopup(true);
                  }}
                >
                  <img
                    src={artist?.image || `/images/user.jpg`}
                    alt="playlist-img"
                    className="w-full h-full object-cover rounded-full cursor-pointer"
                  />
                  <div className="w-full h-full absolute top-0 left-0 hidden group-hover:flex items-center justify-center rounded-full bg-black/45 cursor-pointer transition">
                    <PiNotePencil
                      className="brightness-150 text-white"
                      size={50}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2">{artist?.name}</h2>
                  <p className="text-muted-foreground mb-4">{artist?.bio}</p>
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {(artist?.followers.users.length + artist?.followers.artists.length).toLocaleString()} followers
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {(artist?.following.users.length + artist?.following.artists.length).toLocaleString()} following
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <StatsCards stats={stats} />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer  hover:border-primary/50">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Music className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Upload Song</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your latest track with the world
                  </p>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer  hover:border-primary/50">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Disc className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Create Album</h3>
                  <p className="text-sm text-muted-foreground">
                    Bundle your songs into an album
                  </p>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer  hover:border-primary/50">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">View Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your music pe rformance
                  </p>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6 w-full">
              <h3 className="text-lg font-semibold mb-4">Recent Songs</h3>

              <div className="space-y-4 w-full">
                {artist?.songs?.map((song) => (
                  <ArtistSongRow key={song._id} song={song}>
                    <Badge variant={song.album ? "default" : "secondary"}>
                      {song.album ? "Album" : "Single"}
                    </Badge>
                  </ArtistSongRow>
                ))}
              </div>
            </Card>
            {/* // trailers for edit artist details */}
            <EditArtistDetailsPopup
              open={showPopup}
              onClose={() => setShowPopup(false)}
              artist={artist}
              onUpdate={()=>{setIsUpdated(true)}}
            />
          </div>
        )
      )}
    </>
  );
};

export default ArtistOverview;
