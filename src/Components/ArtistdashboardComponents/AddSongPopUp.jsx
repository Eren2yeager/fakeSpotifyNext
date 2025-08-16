"use client";
import { GrAdd } from "react-icons/gr";
import { useState } from "react";
import GENRES from "@/data/genres.json";
import { useTransition } from "react";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { Dialog } from "../ui/Dialog";
import { PiNotePencil } from "react-icons/pi";
import { useImageProcessor } from "../Helper/ImageCropper";
/**
 * AddSongPopup
 *
 * This component is safe for Next.js build and deployment.
 * - No server-only code or Node.js APIs are imported or used.
 * - All logic is client-side and browser-compatible.
 */
const AddSongPopup = ({ open, onClose, onUpdate }) => {
  const [pending, startTransition] = useTransition();
  const toast = useSpotifyToast();
  const [name, setName] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [image, setImage] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [lrcFile, setLrcFile] = useState(null);
  const [preview, setPreview] = useState("/images/notfound.png");


  const handleImageProcessed = (processedFile) => {
    setImage(processedFile);
    setPreview(URL.createObjectURL(processedFile));
    toast({ text: "Image processed successfully! Automatically cropped to square and resized." });
  };

  const handleImageError = (errorMessage) => {
    toast({ text: errorMessage });
  };

  const { handleImageChange } = useImageProcessor(handleImageProcessed, handleImageError);


  const handleSubmit = (e) => {
    e.preventDefault();

    // FormData is safe to use in the browser
    const formData = new FormData();
    formData.set("type", "addSong");
    formData.set("name", name);
    selectedGenres.forEach((g) => formData.append("genres", g));

    if (image) formData.set("image", image);
    if (audioFile) formData.set("audioFile", audioFile);
    if (lrcFile) formData.set("lrcFile", lrcFile);

    startTransition(async () => {
      try {
        const res = await fetch("/api/artistDashboard/songs", {
          method: "POST",
          body: formData,
        });

        let result = null;
        try {
          result = await res.json();
        } catch (jsonErr) {
          // fallback if response is not JSON
        }

        if (!res.ok) {
          // Try to show error from API if present
          if (result && result.error) {
            toast({ text: result.error });
          } else {
            toast({ text: "Failed to add song" });
          }
          return;
        }

        toast({ text: "Song Added" });
        onUpdate();
        onClose();
      } catch (err) {
        toast({ text: err?.message || "Failed to add song" });
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
                  className={`w-full p-3 text-center mx-auto font-bold text-black rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 flex items-center justify-center ${
                    pending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                  } ${audioFile ? "bg-white/80" : "bg-green-600"}`}
                >
                  {audioFile ? "File Selected" : "Choose File"}
                </span>
              </label>
            </div>
          </div>
          <div>
  <label className="block mb-1 text-sm text-gray-300">Lyrics File (.lrc) (optional)</label>
  <div className="relative">
    <label className="w-full flex items-center cursor-pointer">
      <input
        type="file"
        accept=".lrc"
        onChange={(e) => setLrcFile(e.target.files[0])}
        disabled={pending}
        className="hidden"
      />
      <span
        className={`w-full p-3 text-center mx-auto font-bold text-black rounded-lg
          ${pending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
          ${lrcFile ? "bg-white/80" : "bg-green-600"}`
        }
      >
        {lrcFile ? "File Selected" : "Choose .lrc File"}
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
      <p className="text-xs text-gray-400 mt-4">
        Upload any image and we'll automatically crop it to a perfect square and resize it to 300x300 pixels.
      </p>
    </Dialog>
  );
};

export default AddSongPopup;
