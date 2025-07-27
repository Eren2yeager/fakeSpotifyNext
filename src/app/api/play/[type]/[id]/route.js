// File: app/api/play/[type]/[id]/route.js

import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import Album from '@/models/Album';
import Artist from '@/models/Artist';
import Song from '@/models/Song';

export async function GET(req, { params }) {
  const { type, id } = await params;

  await connectDB();

  try {
    if (type === 'Playlist') {
      const user = await User.findOne({ 'playlists._id': id }, {
        playlists: { $elemMatch: { _id: id } },
      }).populate({
        path: 'playlists.songs.song',
        populate: [
          { path: 'artist', select: 'name image bio' },
          { path: 'album', select: 'name image' },
        ],
      });

      if (!user || !user.playlists || user.playlists.length === 0)
        return new Response(JSON.stringify({ error: 'Playlist not found or empty' }), { status: 404 });

      const playlist = user.playlists[0];
      const songs = playlist.songs.map((entry) => entry.song);

      return Response.json({
        songs,
        current: songs[0],
        context: { type: playlist.type, id: playlist._id, name: playlist.name },
      });
    }

    if (type === 'Album') {
      const songs = await Song.find({ album: id })
        .populate('artist', 'name image bio')
        .populate('album', 'name image')
        .sort({ createdAt: 1 });

      if (!songs || songs.length === 0)
        return new Response(JSON.stringify({ error: 'Album has no songs' }), { status: 404 });

      const album = await Album.findById(id);

      return Response.json({
        songs,
        current: songs[0],
        context: { type: album.type || 'Album', id: album._id, name: album.name },
      });
    }

    if (type === 'Artist') {
      const songs = await Song.find({ artist: id })
        .populate('artist', 'name image bio')
        .populate('album', 'name image')
        .sort({ createdAt: 1 })
        .limit(10);

      if (!songs || songs.length === 0)
        return new Response(JSON.stringify({ error: 'Artist has no songs' }), { status: 404 });

      const artist = await Artist.findById(id);

      return Response.json({
        songs,
        current: songs[0],
        context: { type: artist.type || 'Artist', id: artist._id, name: artist.name },
      });
    }

    if (type === 'Song') {
      const song = await Song.findById(id)
        .populate('artist', 'name image bio')
        .populate('album', 'name image');

      if (!song)
        return new Response(JSON.stringify({ error: 'Song not found' }), { status: 404 });

      return Response.json({
        songs: [song],
        current: song,
        context: { type: song.type || 'Song', id: song._id, name: song.name },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid type' }), { status: 400 });
  } catch (err) {
    console.error('❌ Error in /api/play:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
