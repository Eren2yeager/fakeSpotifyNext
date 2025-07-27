"use client";

import { useState } from "react";
import { useTransition } from "react";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { useUser } from "@/Contexts/userContex";
const AddSongSection = () => {

  const [pending , startTransition] = useTransition()
  const toast = useSpotifyToast();
  const {fetchCurrentUserProfile} = useUser()
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("");
  const [image, setImage] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

 


  const handleSubmit = (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.set("type", "addSong");
    formData.set("name", name);
    formData.set("genre", genre);

    if (image) formData.set("image", image);
    if (audioFile) formData.set("audioFile", audioFile);

  
    startTransition(async () => {
      const res = await fetch("/api/artist/song", {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) {
        toast({ text: "failed" });
        return;
      }
  
      const result = await res.json();
      if (result.message) {
        fetchCurrentUserProfile();
        toast({ text: "Song Added"});
      }
    });
  };

  return (
    <div className=" p-4 sm:p-6 md:p-10 text-white bg-[#121212] min-h-screen flex flex-col items-center w-full  overflow-y-auto">
      <h2 className="text-3xl font-bold mb-6">Add New Song</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-xl bg-[#1e1e1e] p-6 rounded-2xl shadow-xl w-full"
      >
        <div>
          <label className="block mb-1 text-sm text-gray-300">Song Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter song name"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-sm text-gray-300">Genre</label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full p-3 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter song name"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full p-3 bg-zinc-800 text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm text-gray-300">Audio File</label>
          <input
            type="file"
            accept="audio/mp3"
            onChange={(e) => setAudioFile(e.target.files[0])}
            className="w-full p-3 bg-zinc-800 text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 transition text-white font-semibold py-3 rounded-xl"
          disabled={pending}
        > {pending ? "Uploading" : " Upload Song"}
         
        </button>
      </form>
    </div>
  );
};

export default AddSongSection;
