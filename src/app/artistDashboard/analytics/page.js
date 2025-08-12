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
import dateFormatter from "@/functions/dateFormatter";
const ArtistOverview = () => {
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
    startTransition(async () => {
      await fetchArtist();
    });
  }, []);


  
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




  return (
    <>
      {pending ? (
        <div className="flex w-full h-full justify-center items-center">
          <ThreeDotsLoader />
        </div>
      ) :
      artist && (
        <div className="space-y-6 pb-10">
          <h2 className="text-2xl font-bold">Analytics</h2>
          <StatsCards stats={stats} />

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performing Songs</h3>
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
        </div>
      )}
    </>
  );
};

export default ArtistOverview;
