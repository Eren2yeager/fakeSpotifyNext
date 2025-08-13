"use client";
import { GrAdd } from "react-icons/gr";
import { useState } from "react";
import GENRES from "@/data/genres.json";
import { useTransition } from "react";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { useUser } from "@/Contexts/userContex";
import { Dialog } from "../ui/Dialog";
import { PiNotePencil } from "react-icons/pi";
import { useRouter } from "next/navigation";

const AddSongPopup = ({ open, onClose, onUpdate }) => {
  const [pending, startTransition] = useTransition();
  const toast = useSpotifyToast();
  const [name, setName] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [image, setImage] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [preview, setPreview] = useState("/images/notfound.png");

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxKB = 5120; // 5 MB
    if (file.size > maxKB * 1024) {
      toast({ text: `Image too large. Maximum size is ${maxKB/1024}MB` });
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
    formData.set("name", name);
    selectedGenres.forEach((g) => formData.append("genres", g));

    if (image) formData.set("image", image);
    if (audioFile) formData.set("audioFile", audioFile);

    startTransition(async () => {
      const res = await fetch("/api/artistDashboard/songs", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast({ text: "failed" });
        return;
      }

      const result = await res.json();
      if (result) {
        toast({ text: "Song Added" });
        onUpdate();
      }
      onClose();
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

      <h2 className="text-2xl font-bold mb-6 mr-auto text-white">Add New Song</h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-8 w-full"
      >
        {/* Image Preview */}
        <div className="flex w-full md:w-auto justify-center md:justify-start items-center">
          <label className="group w-40 h-40 md:w-48 md:h-48 bg-neutral-800 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative shadow-lg border-2 border-zinc-700">
            <input
              type="file"
              accept="image/*"
              disabled={pending}
              onChange={handleImageChange}
              className="hidden"
            />
            <img
              src={preview}
              alt="Song Cover"
              className="object-cover w-full h-full group-hover:opacity-70 transition"
            />
            <div className="w-full h-full flex absolute top-0 left-0 group-hover:bg-black/40 rounded-xl items-center justify-center transition">
              <PiNotePencil
                className="text-white opacity-80 group-hover:opacity-100"
                size={48}
              />
            </div>
          </label>
        </div>
        <div className="flex flex-col w-full flex-1 gap-4">
          <div>
            <label className="block mb-1 text-sm text-gray-300">Song name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
              className="w-full p-3 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Song name"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-300">Genres</label>
            <div className="flex flex-wrap gap-2 p-2 bg-zinc-800 rounded-xl max-h-40 overflow-y-auto">
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
                    className={`px-3 py-1 rounded-full border text-sm font-medium transition-all duration-150 ${
                      active
                        ? "border-transparent scale-105 shadow-md"
                        : "border-zinc-600 hover:border-green-400"
                    }`}
                    style={{
                      backgroundColor: active ? color : "#23232b",
                      color: active ? "#fff" : "#e5e7eb",
                    }}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
            {/* <div className="mt-2 text-xs text-gray-400">Selected: {selectedGenres.join(", ") || "None"}</div> */}
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Audio File
            </label>
            <div className="relative">
              <label className="w-full flex items-center cursor-pointer">
                <input
                  type="file"
                  accept="audio/mp3"
                  onChange={(e) => setAudioFile(e.target.files[0])}
                  disabled={pending}
                  className="hidden"
                  required
                />
                <span
                  className={`w-full p-3 text-center mx-auto font-bold bg-white/80 text-black rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 flex items-center justify-center ${
                    pending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {audioFile ? "File Selected" : "Choose File"}
                </span>
              </label>
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

export default AddSongPopup;
