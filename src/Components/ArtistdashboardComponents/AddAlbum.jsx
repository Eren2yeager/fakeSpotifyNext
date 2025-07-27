"use client";
import { useState } from "react";

export default function AddAlbum() {
  const [albumName, setAlbumName] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [coverFile, setCoverFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      albumName,
      albumDesc,
      coverFile,
    });
    // ⏳: Here you'll handle the upload logic
  };

  return (
    <section className=" p-4 sm:p-6 md:p-10 text-white bg-neutral-900 min-h-screen flex flex-col items-center w-full  overflow-auto">
      <h2 className="text-2xl font-bold mb-6">Add New Album</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-neutral-800 p-6 rounded-xl shadow-lg max-w-xl w-full "
      >
        {/* Album Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Album Name</label>
          <input
            type="text"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            placeholder="e.g. My First Album"
            className="w-full p-3 rounded-lg bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Album Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={albumDesc}
            onChange={(e) => setAlbumDesc(e.target.value)}
            placeholder="Write about this album..."
            className="w-full p-3 rounded-lg bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={4}
          ></textarea>
        </div>

        {/* Album Cover Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files[0])}
            className="block text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 text-white rounded-lg text-sm font-semibold"
        >
          Create Album
        </button>
      </form>
    </section>
  );
}
