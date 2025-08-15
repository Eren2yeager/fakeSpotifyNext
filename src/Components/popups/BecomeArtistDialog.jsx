"use client";

import { useState, useTransition } from "react";
import { GrAdd } from "react-icons/gr";
import { PiNotePencil } from "react-icons/pi";
import { Dialog } from "../ui/Dialog";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { useUser } from "@/Contexts/userContex";
import { useImageProcessor } from "../Helper/ImageCropper";

export default function BecomeArtistDialog({ open, onClose }) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("/images/user.jpg");
  const toast = useSpotifyToast();
  const { fetchCurrentUserProfile } = useUser();

  const handleImageProcessed = (processedFile) => {
    setImageFile(processedFile);
    setPreview(URL.createObjectURL(processedFile));
    toast({ text: "Image processed successfully! Automatically cropped to square and resized." });
  };

  const handleImageError = (errorMessage) => {
    toast({ text: errorMessage });
  };

  const { handleImageChange } = useImageProcessor(handleImageProcessed, handleImageError);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !bio || !imageFile) {
      toast({ text: "All fields are required" });
      return;
    }

    const formData = new FormData();
    formData.set("name", name);
    formData.set("bio", bio);
    formData.set("image", imageFile);

    startTransition(async () => {
      const res = await fetch("/api/become-artist", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast({ text: "Something went wrong" });
        onClose();
        return;
      }

      const result = await res.json();
      if (result && result.success) {
        await fetchCurrentUserProfile();
        toast({ text: "You are now an artist!" });
        onClose();
      } else {
        toast({ text: "Something went wrong" });
        onClose();
      }
    });
  };

  return (
    <Dialog onClose={onClose} open={open}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-xl"
      >
        <GrAdd className="rotate-45" />
      </button>

      <h2 className="text-2xl text-white font-bold mb-6">Become an Artist</h2>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center md:flex-row gap-6"
      >
        {/* Image */}
        <label className="group w-40 h-40 sm:min-w-[200px] sm:h-[200px] bg-neutral-800 rounded-full flex items-center justify-center cursor-pointer overflow-hidden relative">
          <input
            type="file"
            disabled={pending}
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <img
            src={preview}
            alt="Artist"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
            <PiNotePencil size={40} className="text-white" />
          </div>
        </label>

        {/* Name and Bio */}
        <div className="flex flex-col w-full gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={pending}
            className="bg-neutral-800 text-white p-3 rounded-md outline-none"
            placeholder="Artist Name"
            required
          />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={pending}
            className="bg-neutral-800 text-white p-3 rounded-md outline-none min-h-[100px]"
            placeholder="Tell us about yourself"
            required
          />
          <button
            type="submit"
            disabled={pending}
            className={`self-start ${
              pending ? "bg-white/40 cursor-not-allowed" : "bg-white"
            } text-black font-semibold px-6 py-2 rounded-full mt-2 hover:scale-105 transition`}
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
}
