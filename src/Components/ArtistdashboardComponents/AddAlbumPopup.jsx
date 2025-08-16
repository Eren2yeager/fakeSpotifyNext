"use client";

import { useState, useTransition } from "react";
import { GrAdd } from "react-icons/gr";
import { PiNotePencil } from "react-icons/pi";
import { Dialog } from "../ui/Dialog";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { useImageProcessor } from "../Helper/ImageCropper";

export default function AddAlbumPopup({ open, onClose, onUpdate }) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("/images/notfound.png");
  const toast = useSpotifyToast();

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

    if (!name || !image) {
      toast({ text: "Album name and image are required" });
      return;
    }

    const formData = new FormData();
    formData.set("name", name);
    formData.set("description", description);
    formData.set("image", image);

    startTransition(async () => {
      const res = await fetch("/api/artistDashboard/albums", {
        method: "POST",
        body: formData,
      });

      let result = null;
      try {
        result = await res.json();
      } catch (err) {
        // fallback if response is not JSON
      }

      if (!res.ok) {
        if (result && result.error) {
          toast({ text: result.error });
        } else {
          toast({ text: "Failed to create album" });
        }
        return;
      }

      if (result && result.success) {
        toast({ text: "Album created successfully!" });
        onUpdate();
        onClose();
      } else {
        toast({ text: (result && result.error) ? result.error : "Failed to create album" });
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-xl"
        type="button"
        aria-label="Close"
      >
        <GrAdd className="text-xl transform rotate-45" />
      </button>
      <h2 className="text-2xl font-bold mb-6 text-white">Add New Album</h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center md:items-start md:flex-row gap-6 text-white"
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
            alt="Playlist"
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
          {/* Album Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Album Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My First Album"
              disabled={pending}
              className="w-full p-3 rounded-lg bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Album Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your album..."
              disabled={pending}
              className="w-full p-3 rounded-lg bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className={`self-start ${
              pending
                ? "bg-white/45 cursor-not-allowed"
                : "bg-white cursor-pointer"
            } text-black font-semibold px-6 py-2 rounded-full mt-2 hover:scale-105 transition`}
          >
            {pending ? "Creating..." : "Create Album"}
          </button>
        </div>
      </form>

      <p className="text-xs text-gray-400 mt-4">
        Upload any image and we'll automatically crop it to a perfect square and resize it to 300x300 pixels.
      </p>
    </Dialog>
  );
}
