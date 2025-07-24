import React, { useState, useEffect } from "react";
import TopResultCard from "./TopResultCard";
import SectionHeader from "./SectionHeader";
import { useNavigate } from "react-router-dom";
import HorizentalItemsList from "../horizentalLists/horizentalItemsList";
import SearchPlaylistSongCard from "../playlistCards/searchPlaylistSongCard";
import FailedToFetch from "../Helper/failedToFetch";

const SearchPage = ({ searchQuery }) => {
  const [results, setResults] = useState(null);
  useEffect(() => {
    if (searchQuery) {
      fetch(`http://localhost:5000/api/search?q=${searchQuery}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
          console.log(data);
        })
        .catch((err) => console.error("Search error:", err));
    }
  }, [searchQuery]);

  if (!searchQuery) return null;

  return (
    <>
      {!results ? (
        <div className="w-full h-full flex justify-center items-center">

          <FailedToFetch />
        </div>
      ) : results.length ==0 ? <div className="min-w-full  min-h-full flex mx-auto my-auto font-bold text-3xl">Results not found</div> : (
        <div className="py-4 text-white space-y-6">
          <div className="flex w-full flex-col lg:flex-row lg:justify-between ">
            {results?.top && (
              <>
                <div className="flex flex-col gap-5 w-auto lg:w-[400px] p-2 ">
                  <p className="text-2xl font-bold ">Top result</p>
                  <TopResultCard item={results.top} />
                </div>
              </>
            )}

            {results?.songs?.length > 0 && (
              <>
                <div className="flex flex-col p-2 w-full gap-5">
                  <p className="font-bold text-2xl ">Songs</p>
                  <div className="">
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
              </>
            )}
          </div>

          {results?.artists?.length > 0 && (
            <>
              <HorizentalItemsList
                listItems={results?.artists}
                heading="Artists"
              />
            </>
          )}
          {results?.albums?.length > 0 && (
            <>
              <HorizentalItemsList
                listItems={results?.albums}
                heading="Albums"
              />
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SearchPage;
