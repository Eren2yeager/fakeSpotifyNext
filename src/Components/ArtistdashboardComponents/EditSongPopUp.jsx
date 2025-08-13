"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import GENRES from "@/data/genres.json";
import { useTransition } from "react";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { useUser } from "@/Contexts/userContex";
import { Dialog } from "../ui/Dialog";
import { useRouter } from "next/navigation";

// Dynamically import icons to avoid Next.js build issues
const GrAdd = dynamic(() =>
  import("react-icons/gr").then((mod) => mod.GrAdd),
  { ssr: false }
);
const PiNotePencil = dynamic(() =>
  import("react-icons/pi").then((mod) => mod.PiNotePencil),
  { ssr: false }
);

const EditSongPopup = ({ song, open, onClose, onUpdate }) => {
  const [pending, startTransition] = useTransition();
  const toast = useSpotifyToast();
  const [name, setName] = useState(song?.name);
  const [selectedGenres, setSelectedGenres] = useState(
    Array.isArray(song?.genres)
      ? song.genres
      : song?.genre
      ? [song.genre]
      : []
  );
  const [image, setImage] = useState(song?.image);
  const [preview, setPreview] = useState(song?.image);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxKB = 5120; // 5 MB
    if (file.size > maxKB * 1024) {
      toast({ text: `Image too large. Maximum size is ${maxKB / 1024}MB` });
      e.target.value = "";
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const { width, height } = bitmap;
      bitmap.close();
      if (width !== height) {
        toast({ text: "Image must be square (e.g., 300x300)" });
        e.target.value = "";
        return;
      }
      if (width < 300) {
        toast({ text: "Image too small. Minimum is 300x300" });
        e.target.value = "";
        return;
      }
      if (width > 1000) {
        toast({ text: "Image too large. Maximum is 1000x1000" });
        e.target.value = "";
        return;
      }
    } catch (err) {
      toast({ text: "Unable to read image. Choose a valid image file" });
      e.target.value = "";
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.set("type", "addSong");
    formData.set("id", song._id);
    formData.set("name", name);
    selectedGenres.forEach((g) => formData.append("genres", g));

    if (image) formData.set("image", image);

    startTransition(async () => {
      const res = await fetch("/api/artistDashboard/songs", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        toast({ text: "failed" });
        return;
      }

      const result = await res.json();
      if (result) {
        toast({ text: "Song Edited" });
        onUpdate();
        onClose();
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <button
        onClick={() => {
          onClose();
        }}
        className="absolute top-4 right-4 text-white text-xl"
      >
        <GrAdd className="text-xl transform rotate-45" />
      </button>

      <h2 className="text-2xl font-bold mb-6  text-white">Edit Song</h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center md:items-start md:flex-row gap-6"
      >
        {/* Image Preview */}
        <label className="group w-45 h-45 bg-neutral-800 rounded-md flex items-center justify-center cursor-pointer overflow-hidden relative">
          <input
            type="file"
            accept="image/*"
            disabled={pending}
            onChange={handleImageChange}
            className="hidden"
          />
          <img
            src={preview}
            alt="song"
            className="object-cover w-full h-full ml-auto group-hover:opacity-70 transition"
          />
          <div className="w-[100%] h-[100%] flex hover:flex absolute top-0 right-0 sm:hidden group-hover:block rounded-md bg-black/45 hover:bg-black/45 cursor-pointer">
            <PiNotePencil
              className="mx-auto my-auto brightness-150 text-white"
              size={50}
            />
          </div>
        </label>
        <div className="flex flex-col w-full flex-1 gap-3">
          <div>
            <label className="block mb-1 text-sm text-gray-300 ">
              Song name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
              className="w-full p-3 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter song name"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-300 mr-auto">
              Genres
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-auto p-2 bg-zinc-800 rounded-lg">
              {GENRES.map(({ name: g, color }) => {
                const active = selectedGenres.includes(g);
                return (
                  <button
                    type="button"
                    key={g}
                    onClick={() =>
                      setSelectedGenres((prev) =>
                        prev.includes(g)
                          ? prev.filter((x) => x !== g)
                          : [...prev, g]
                      )
                    }
                    className={`text-left px-2 py-1 rounded`}
                    style={{
                      backgroundColor: active ? color : "#3f3f46",
                      color: active ? "#fff" : "#e5e7eb",
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Selected: {selectedGenres.join(", ") || "None"}
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className={`self-start ${
              pending
                ? "bg-white/45 cursor-not-allowed"
                : "bg-white cursor-pointer"
            }  text-black font-semibold px-6 py-2 rounded-full mt-2 hover:scale-105 transition`}
          >
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default EditSongPopup;
