const SongResultItem = ({ song }) => (
    <div className="flex items-center justify-between px-2 py-1 hover:bg-white/5 rounded">
      <div className="flex items-center gap-3">
        <img src={song.image} alt="" className="w-10 h-10 rounded object-cover" />
        <div>
          <p className="text-sm font-medium">{song.name}</p>
          <p className="text-xs text-gray-400">{song.artist}</p>
        </div>
      </div>
      <p className="text-sm text-gray-300">{song.duration}</p>
    </div>
  );
  
  export default React.memo(SongResultItem);
  