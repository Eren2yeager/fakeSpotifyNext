"use client";
import { useState } from "react";
import { GrAdd } from "react-icons/gr";
import { PiNotePencil } from "react-icons/pi";
import { useTransition } from "react";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { Dialog } from "../ui/Dialog";

/**
 * AddAlbumPopup
 * 
 * This component is safe for Next.js build and deployment.
 * - No server-only code or Node.js APIs are imported or used.
 * - All logic is client-side and browser-compatible.
 */
export default function AddAlbumPopup({ open, onClose, onUpdate }) {
  const [pending, startTransition] = useTransition();
  const toast = useSpotifyToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("/images/notfound.png");

  const handleSubmit = (e) => {
    e.preventDefault();

    // FormData is safe to use in the browser
    const formData = new FormData();
    formData.set("type", "addAlbum");
    formData.set("name", name);
    formData.set("description", description);

    if (image) formData.set("image", image);

    // Remove console.log(formData); as it doesn't print formData contents usefully and can cause issues in some environments

    startTransition(async () => {
      try {
        const res = await fetch("/api/artistDashboard/albums", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          toast({ text: "failed" });
          return;
        }

        const result = await res.json();
        if (result) {
          toast({ text: "Album Added" });
          onUpdate();
          onClose();
        }
      } catch (err) {
        toast({ text: "Network error" });
      }
    });
  };

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
      // createImageBitmap is browser-safe, but check for support
      if (typeof createImageBitmap !== "function") {
        toast({ text: "Image preview not supported in this browser" });
        e.target.value = "";
        return;
      }
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
              placeholder="Write about this album..."
              disabled={pending}
              className="w-full p-3 h-15 rounded-lg bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={4}
            ></textarea>
          </div>
          {/* Submit */}
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
}
