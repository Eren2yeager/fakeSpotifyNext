// All helpers in this file are safe for Next.js build and deployment.
// No server-only or Node.js APIs are imported or used.

import dateFormatter from "../../functions/dateFormatter";

// UI Button component
export const Button = ({ children, className, ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors ${className || ""}`}
    {...props}
  >
    {children}
  </button>
);

// UI Card component
export const Card = ({ children, className, onClick }) => (
  <div
    className={`rounded-lg bg-white/15 shadow-sm p-4 text-[var(--text-color)] ${className || ""}`}
    onClick={onClick}
  >
    {children}
  </div>
);

// UI Badge component
export const Badge = ({ children, variant }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
      variant === "default"
        ? "bg-blue-500 text-white"
        : "bg-gray-200 text-gray-800"
    }`}
  >
    {children}
  </span>
);

// StatsCards: grid of stat cards
export const StatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              {/* stat.icon is a React component */}
              {stat.icon && <stat.icon className="h-5 w-5 text-primary" />}
            </div>
            {/* 
            <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {stat.change}
            </span> 
            */}
          </div>
          <div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

// SongCardArtist: displays a song row for artist dashboard
export const SongCardArtist = (props) => {
  return (
    <div
      className="flex items-center text-gray-400 p-1 hover:bg-white/8 rounded-[5px] group/songbar cursor-pointer w-full"
    >
      <div className="w-[40px]">
        <span className="px-1 mx-auto">
          {props.index + 1}
        </span>
      </div>
      <div className="truncate flex items-center gap-3 mr-auto">
        <div className="w-10 h-10 relative">
          <img
            src={props.item?.image || "/images/notfound.png"}
            alt={`song cover ${props.index}`}
            className="min-w-10 min-h-10 rounded cursor-pointer"
          />
        </div>
        <div className="truncate">
          <div className="font-semibold truncate">{props.item?.name}</div>
          <div className="text-sm max-w-[100%] truncate">
            {props.item?.artist?.name || "Unknown Artist"}
          </div>
        </div>
      </div>
      <div className="truncate max-w-full">
        {props.item?.album?.name || "Single"}
      </div>
      {props.added && (
        <div className="mr-auto truncate max-w-full">
          {dateFormatter(props.added)}
        </div>
      )}
      <div className="w-[50px] text-center ml-auto hidden sm:block">
        {props.item?.duration}
      </div>
      <div
        className="w-[50px] truncate flex justify-end sm:justify-center sm:invisible group-hover/songbar:visible"
      >
        {/* <ThreeDots song={props.item} playlistId={props.playlistId} /> */}
      </div>
    </div>
  );
};
