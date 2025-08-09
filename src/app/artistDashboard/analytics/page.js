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

import {
  Card,
  StatsCards,
  Button,
  Badge,
} from "@/Components/ArtistdashboardComponents/artistDashboardHelpers";
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

                    <Badge variant={song.album ? "default" : "secondary"}>
                      {song.album ? "Album" : "Single"}
                    </Badge>
    
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ArtistOverview;
