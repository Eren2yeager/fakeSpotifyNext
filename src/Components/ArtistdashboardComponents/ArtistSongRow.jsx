import React from "react";
import { Music } from "lucide-react";

export default function ArtistSongRow({ song, children }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row items-center sm:justify-between p-4 rounded-lg border hover:shadow-sm transition-all w-full">
      <div className="flex items-center space-x-4 self-start max-w-full flex-1 min-w-0">
        <div className="min-w-16 min-h-16 max-w-16 max-h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
          {song?.image ? (
            <img src={song.image} alt={song.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <h4 className="font-semibold truncate" title={song?.name}>
            {song?.name}
          </h4>
          <p className="text-sm text-muted-foreground truncate" title={song?.duration}>
            {song?.duration}
          </p>
          {typeof song?.views === "number" && (
            <p className="text-xs text-muted-foreground truncate" title={`${song.views.toLocaleString()} views`}>
              {song.views.toLocaleString()} views
            </p>
          )}
        </div>
      </div>

      {/* Right-side content (actions, metadata) */}
      <div className="flex items-center space-x-6 self-end sm:self-auto flex-shrink-0">
        {children}
      </div>
    </div>
  );
}


