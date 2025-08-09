"use client";

import { useState, useEffect } from "react";
import { useTransition } from "react";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  Clock,
  Upload,
  Settings,
  Plus,
  Eye,
  BarChart3,
} from "lucide-react";
import {
  Badge,
  Card,
  Button,
} from "@/Components/ArtistdashboardComponents/artistDashboardHelpers";
import dateFormatter from "@/functions/dateFormatter";
import ArtistSongThreeDots from "@/Components/ArtistdashboardComponents/artistSongThreeDots";
import ArtistAlbumThreeDots from "@/Components/ArtistdashboardComponents/artistAlbumThreeDots";
import ThreeDotsLoader from "@/Components/Helper/ThreeDotsLoader";
import { useParams } from "next/navigation";
import NotFound from "@/Components/Helper/not-found";

import AddSongToAlbumPopup from "@/Components/ArtistdashboardComponents/addSongToAlbum";

const AlbumDetails = () => {
  const [album, setAlbum] = useState(null);
  const [pending, startTransition] = useTransition();
  const [isUpdated, setIsUpdated] = useState(false)
  const { id } = useParams();

  const fetchAlbum = async () => {
    const res = await fetch(`/api/artistDashboard/albums/${id}`);
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setAlbum(data);
    console.log("Fetched albums:");
  };
  useEffect(() => {
    setIsUpdated(false)
    startTransition(async () => {
      await fetchAlbum();
    });
  }, [isUpdated]);

  // Mock album data based on your Mongoose schema

  // Mock statistics for artist

  const totalDuration = album?.songs.reduce((total, song) => {
    const [minutes, seconds] = song.duration.split(":").map(Number);
    return total + minutes * 60 + seconds;
  }, 0);

  const formatTotalDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;
  };

  // for add song feature
  // const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState(null);

  return (
    <>
      {pending ? (
        <div className="flex justify-center w-full  h-full items-center">
          <ThreeDotsLoader />
        </div>
      ) : (
        album && (
          <div className="min-h-screen bg-gradient-to-b from-primary/20 via-background to-background text-white">
            {/* Header Section - Artist Dashboard Style */}
            <div className="relative">
              <div className="container mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-end">
                  {/* Album Cover */}
                  <div className="w-32 h-32 sm:w-48 sm:h-48 lg:w-60 lg:h-60 rounded-lg overflow-hidden shadow-2xl bg-muted flex-shrink-0  sm:mx-0">
                    <img
                      src={album?.image || "/images/notfound.png"}
                      alt={album?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Album Info */}
                  <div className="flex-1 text-center sm:text-left max-w-full ">
                    <div className="flex flex-row items-center gap-4 mb-4 min-w-0">
                      <Badge
                        className="bg-primary/20 text-primary border-0 self-start truncate max-w-[80px] sm:max-w-[120px] md:max-w-[160px] lg:max-w-[200px] overflow-hidden"
                        title={album?.specialtype}
                      >
                        {album?.specialtype}
                      </Badge>
                      <div
                        className="text-xs sm:text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-[180px] md:max-w-[240px] lg:max-w-[320px] overflow-hidden"
                        title={`Released: ${dateFormatter(album?.createdAt)}`}
                      >
                        Released: {dateFormatter(album?.createdAt)}
                      </div>
                    </div>

                    <h1
                      className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-black mb-3 mr-auto sm:mb-4 text-foreground leading-tight max-w-full truncate text-left"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                        display: "block",
                        textAlign: "left",
                      }}
                      title={album?.name}
                    >
                      {album?.name}
                    </h1>

                    <div className="flex flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground max-w-full min-w-0 overflow-hidden">
                      <div className="flex items-center justify-center sm:justify-start gap-2 min-w-0 max-w-full overflow-hidden">
                        <img
                          src={album?.artist.image}
                          alt={album?.artist.name}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
                        />
                        <span
                          className="font-semibold text-foreground truncate max-w-[100px] sm:max-w-[160px] md:max-w-[200px] lg:max-w-[240px] overflow-hidden"
                          title={album?.artist.name}
                        >
                          {album?.artist.name}
                        </span>
                      </div>
                      <span className="truncate">•</span>
                      <span
                        className="truncate max-w-[60px] overflow-hidden"
                        title={`${album?.songs.length} songs`}
                      >
                        {album?.songs.length} songs
                      </span>
                      <span className="truncate">•</span>
                      <span
                        className="truncate max-w-[60px] overflow-hidden"
                        title={formatTotalDuration(totalDuration)}
                      >
                        {formatTotalDuration(totalDuration)}
                      </span>
                    </div>

                    {/* Artist Stats */}
                    {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="text-center sm:text-left">
                  <div className="text-lg sm:text-xl font-bold text-primary">{albumStats.totalPlays.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Plays</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-lg sm:text-xl font-bold text-green-600">{albumStats.totalEarnings}</div>
                  <div className="text-xs text-muted-foreground">Earnings</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-lg sm:text-xl font-bold text-yellow-600">{albumStats.avgRating}★</div>
                  <div className="text-xs text-muted-foreground">Avg Rating</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-lg sm:text-xl font-bold text-blue-600">{albumStats.topCountries.join(", ")}</div>
                  <div className="text-xs text-muted-foreground">Top Markets</div>
                </div>
              </div> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Artist Management Controls */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
              <div className="container mx-auto px-4 py-4 ">
                <div className="flex flex-row justify-start gap-3 sm:gap-6">
                  {/* Primary Actions */}
                  <div className="flex items-center justify-start gap-4 w-full p-1.5">
                    <Button
                      variant="outline"
                      className={`flex items-center text-nowrap truncate p-2 rounded-full bg-white/8`}
                      onClick={(e) => {
                        setAnchor(e.currentTarget.getBoundingClientRect());
                      }}
                    >
                      <Plus className=" text-sm" />
                      <span className="hidden sm:block">Add Song</span>

                      {anchor && (
                        <AddSongToAlbumPopup
                          open={anchor}
                          onClose={() => {
                            setAnchor(null);
                          }}
                          album={album}
                          anchorRect={anchor}
                          onUpdate={()=>{setIsUpdated(true)}}
                        />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      className={` flex items-center text-nowrap truncate p-2 rounded-full bg-white/8`}
                    >
                      <ArtistAlbumThreeDots album={album} 
                      onUpdate={()=>{setIsUpdated(true)}}
                      />
                    </Button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex items-center gap-2 ml-auto">
                    {/* <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                <Upload className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                <Settings className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                <Eye className="h-4 w-4" />
              </Button> */}

                    {/* <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full text-destructive hover:text-destructive"
              ></Button> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Songs Management List */}
            <div className="container mx-auto px-4 sm:px-6 pb-20">
              {album?.songs.length == 0 && (
                <NotFound
                  buttonText={"Add Songs"}
                  //   buttonOnClick={() => {
                  //     setOpen(true);
                  //   }}
                  buttonColor={""}
                />
              )}

              {album?.songs.length > 0 && (
                <Card className="p-6 w-full">
                  <div className="space-y-4 w-full">
                    {album?.songs?.map((song) => (
                      <div
                        key={song._id}
                        className="flex flex-col gap-2 sm:flex-row items-center sm:justify-between p-4 rounded-lg  hover:shadow-sm transition-all w-full"
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
                            <h4
                              className="font-semibold truncate"
                              title={song.name}
                            >
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
                              title={song.album ? song.album?.name : "Single"}
                            >
                              {song.album ? song.album?.name : "Single"}
                            </p>
                            <p className="text-xs text-nowrap text-muted-foreground">
                              {dateFormatter(song.createdAt)}
                            </p>
                          </div>
                          <Badge variant={song.album ? "default" : "secondary"}>
                            {song.album ? "Album" : "Single"}
                          </Badge>
                          <ArtistSongThreeDots song={song} album={album} onUpdate={()=>{setIsUpdated(true)}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )
      )}
    </>
  );
};

export default AlbumDetails;
