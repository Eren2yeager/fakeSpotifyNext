// File: app/api/play/[type]/[id]/route.js

import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import Album from '@/models/Album';
import Artist from '@/models/Artist';
import Song from '@/models/Song';
import Playlist from '@/models/Playlist';

export async function GET(req, { params }) {
  const { type, id } =await params;

  await connectDB();

  try {
    if (type === 'Playlist') {
      // Playlist: songs are referenced in Playlist.songs [{song, added}]
      const playlist = await Playlist.findById(id)
        .populate({
          path: 'songs.song',
          populate: [
            { path: 'artist', select: 'name image bio type _id' },
            { path: 'album', select: 'name image _id' },
          ],
        })
        .lean();

      if (!playlist)
        return new Response(JSON.stringify({ error: 'Playlist not found' }), { status: 404 });

      const songs = Array.isArray(playlist.songs)
        ? playlist.songs.map((entry) => entry.song).filter(Boolean)
        : [];

      if (songs.length === 0)
        return new Response(JSON.stringify({ error: 'Playlist is empty' }), { status: 404 });

      return Response.json({
        songs,
        current: songs[0],
        context: { type: playlist.type || 'Playlist', id: playlist._id, name: playlist.name },
      });
    }

    if (type === 'Album') {
      // Album: songs are referenced in Album.songs (array of ObjectId)
      const album = await Album.findById(id)
        .populate({
          path: 'songs',
          populate: [
            { path: 'artist', select: 'name image bio type _id' },
            { path: 'album', select: 'name image _id' },
          ],
        })
        .lean();

      if (!album)
        return new Response(JSON.stringify({ error: 'Album not found' }), { status: 404 });

      const songs = Array.isArray(album.songs)
        ? album.songs.filter(Boolean)
        : [];

      if (songs.length === 0)
        return new Response(JSON.stringify({ error: 'Album has no songs' }), { status: 404 });

      return Response.json({
        songs,
        current: songs[0],
        context: { type: album.type || 'Album', id: album._id, name: album.name },
      });
    }

    if (type === 'Artist') {
      // Artist: songs are referenced in Artist.songs (array of ObjectId)
      const artist = await Artist.findById(id)
        .populate({
          path: 'songs',
          populate: [
            { path: 'artist', select: 'name image bio type _id' },
            { path: 'album', select: 'name image _id' },
          ],
          options: { sort: { createdAt: 1 }, limit: 10 },
        })
        .lean();

      if (!artist)
        return new Response(JSON.stringify({ error: 'Artist not found' }), { status: 404 });

      const songs = Array.isArray(artist.songs)
        ? artist.songs.filter(Boolean)
        : [];

      if (songs.length === 0)
        return new Response(JSON.stringify({ error: 'Artist has no songs' }), { status: 404 });

      return Response.json({
        songs,
        current: songs[0],
        context: { type: artist.type || 'Artist', id: artist._id, name: artist.name },
      });
    }

    if (type === 'Song') {
      const song = await Song.findById(id)
        .populate('artist', 'name image bio type _id')
        .populate('album', 'name image _id')
        .lean();

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
