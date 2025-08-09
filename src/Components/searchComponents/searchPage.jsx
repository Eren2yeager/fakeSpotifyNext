import React, { useState, useEffect  , useContext} from "react";
import TopResultCard from "./TopResultCard";
import SectionHeader from "./SectionHeader";
import { useNavigate } from "react-router-dom";
import HorizentalItemsList from "../horizentalLists/horizentalItemsList";
import SearchPlaylistSongCard from "../playlistCards/searchPlaylistSongCard";
import FailedToFetch from "../Helper/failedToFetch";
import { useTransition } from "react";
import ThreeDotsLoader from "../Helper/ThreeDotsLoader";
import NotFound from "../Helper/not-found";
import AlbumCard from "../horizentalLists/AlbumCard";
import PlayListCard from "../horizentalLists/PlayListCard";
import ArtistCard from "../horizentalLists/ArtistCard";
import ProfileCard from "../horizentalLists/ProfileCard";
import { middleWidthContext } from "@/Contexts/contexts";
const SearchPage = ({ searchQuery, activeItem }) => {
  const [results, setResults] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [isFailedToFetch, setIsFailedToFetch] = useState(false);
  const Context_middle_width = useContext(middleWidthContext);
  const { middleWidth } = Context_middle_width;
  useEffect(() => {
    startTransition(async () => {
      if (searchQuery) {
        fetch(`/api/search?q=${searchQuery}`)
          .then((res) => res.json())
          .then((data) => {
            setResults(data);
            console.log(data);
          })
          .catch((err) => {
            setIsFailedToFetch(true);
            console.error("Search error:", err);
          });
      }
    });
  }, [searchQuery]);

  if (!searchQuery) return null;

  return (
    <>
      {isPending && (
        <div className="flex w-full h-full justify-center items-center">
          <ThreeDotsLoader />
        </div>
      )}

      {isFailedToFetch  && (
        <div className="w-full h-full flex justify-center items-center">
          <FailedToFetch />
        </div>
      )}

      {!isPending && results && (
        <>
          {/* If no results found */}
          {!results.top &&
          (!results.songs || results.songs.length === 0) &&
          (!results.artists || results.artists.length === 0) &&
          (!results.albums || results.albums.length === 0) ? (
            <NotFound
              icon={
                <lord-icon
                  src="https://cdn.lordicon.com/wjyqkiew.json"
                  trigger="loop"
                  delay="1000"
                  state="morph-cross"
                  colors={`primary:#ffffff,secondary:green`}
                  style={{ width: 150, height: 150 }}
                ></lord-icon>
              }
              text={"Not found"}
              position={"center"}
            />
          ) : (
            <>
              {/* for all   */}
              {activeItem == 0 && (
                <div className="py-4 text-white space-y-6">
                  <div className={`flex w-full flex-col ${middleWidth > 640 ? "flex-row" :"flex-col justify-between"} `}>
                    {results?.top && (
                      <div className={`sm:flex flex-col gap-5  ${middleWidth > 640 ? 'w-[400px]' :"w-auto"}  p-2 hidden sm:block`}>
                        <p className="text-2xl font-bold ">Top result</p>
                        <TopResultCard item={results.top} />
                      </div>
                    )}

                    {results?.songs?.length > 0 && (
                      <div className="flex flex-col p-2 w-full gap-5">
                        <p className="font-bold text-2xl ">Songs</p>
                        <div>
                          {results.songs.slice(0, 5).map((song, idx) => (
                            <SearchPlaylistSongCard
                              key={idx}
                              index={idx}
                              item={song}
                              context={{
                                type: "Song",
                                id: song._id,
                                name: song.name,
                              }}
                              allSongs={[song]}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {results?.artists?.length > 0 && (
                    <HorizentalItemsList
                      listItems={results.artists.slice(0, 5)}
                      heading="Artists"
                    />
                  )}
                  {results?.albums?.length > 0 && (
                    <HorizentalItemsList
                      listItems={results.albums.slice(0, 5)}
                      heading="Albums"
                    />
                  )}
                  {results?.playlists?.length > 0 && (
                    <HorizentalItemsList
                      listItems={results.playlists.slice(0, 5)}
                      heading="Public Playlists"
                    />
                  )}
                </div>
              )}
              {/* for only songs */}
              {activeItem == 1 &&
                (results?.songs?.length > 0 ? (
                  <div className="flex flex-col p-2 w-full gap-5">
                    <p className="font-bold text-2xl ">Songs</p>
                    <div>
                      {results.songs.map((song, idx) => (
                        <SearchPlaylistSongCard
                          key={idx}
                          index={idx}
                          item={song}
                          context={{
                            type: "Song",
                            id: song._id,
                            name: song.name,
                          }}
                          allSongs={[song]}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <NotFound
                    icon={
                      <lord-icon
                        src="https://cdn.lordicon.com/wjyqkiew.json"
                        trigger="loop"
                        delay="1000"
                        state="morph-cross"
                        colors={`primary:#ffffff,secondary:green`}
                        style={{ width: 150, height: 150 }}
                      ></lord-icon>
                    }
                    text={"Not found"}
                    position={"center"}
                  />
                ))}
              {/* for only albums  */}
              {activeItem == 2 &&
                (results?.albums?.length > 0 ? (
                  <div className="flex flex-col p-2 w-full gap-5">
                    <p className="font-bold text-2xl ">Albums</p>
                    <div className="flex flex-wrap">
                      {results.albums.map((album, idx) => (
                        <div key={idx}>
                          <AlbumCard item={album} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NotFound
                    icon={
                      <lord-icon
                        src="https://cdn.lordicon.com/wjyqkiew.json"
                        trigger="loop"
                        delay="1000"
                        state="morph-cross"
                        colors={`primary:#ffffff,secondary:green`}
                        style={{ width: 150, height: 150 }}
                      ></lord-icon>
                    }
                    text={"Not found"}
                    position={"center"}
                  />
                ))}
              {/* for only artists  */}
              {activeItem == 3 &&
                (results?.artists?.length > 0 ? (
                  <div className="flex flex-col p-2 w-full gap-5">
                    <p className="font-bold text-2xl ">Artists</p>
                    <div className="flex flex-wrap">
                      {results.artists.map((artist, idx) => (
                        <div key={idx}>
                          <ArtistCard item={artist} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NotFound
                    icon={
                      <lord-icon
                        src="https://cdn.lordicon.com/wjyqkiew.json"
                        trigger="loop"
                        delay="1000"
                        state="morph-cross"
                        colors={`primary:#ffffff,secondary:green`}
                        style={{ width: 150, height: 150 }}
                      ></lord-icon>
                    }
                    text={"Not found"}
                    position={"center"}
                  />
                ))}
              {/* for only artists  */}
              {activeItem == 4 &&
                (results?.playlists?.length > 0 ? (
                  <div className="flex flex-col p-2 w-full gap-5">
                    <p className="font-bold text-2xl ">Public Playlists</p>
                    <div className="flex flex-wrap">
                      {results.playlists.map((playlist, idx) => (
                        <div key={idx}>
                          <PlayListCard item={playlist} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NotFound
                    icon={
                      <lord-icon
                        src="https://cdn.lordicon.com/wjyqkiew.json"
                        trigger="loop"
                        delay="1000"
                        state="morph-cross"
                        colors={`primary:#ffffff,secondary:green`}
                        style={{ width: 150, height: 150 }}
                      ></lord-icon>
                    }
                    text={"Not found"}
                    position={"center"}
                  />
                ))}
              {/* for only profiles  */}
              {activeItem == 5 &&
                (results?.users?.length > 0 ? (
                  <div className="flex flex-col p-2 w-full gap-5">
                    <p className="font-bold text-2xl ">Public Playlists</p>
                    <div className="flex flex-wrap">
                      {results.users.map((user, idx) => (
                        <div key={idx}>
                          <ProfileCard item={user} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NotFound
                    icon={
                      <lord-icon
                        src="https://cdn.lordicon.com/wjyqkiew.json"
                        trigger="loop"
                        delay="1000"
                        state="morph-cross"
                        colors={`primary:#ffffff,secondary:green`}
                        style={{ width: 150, height: 150 }}
                      ></lord-icon>
                    }
                    text={"Not found"}
                    position={"center"}
                  />
                ))}
            </>
          )}
        </>
      )}
    </>
  );
};
export default SearchPage;
