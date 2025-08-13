"use client";

import { useState, useTransition } from "react";
import { GrAdd } from "react-icons/gr";
import { PiNotePencil } from "react-icons/pi";
import { Dialog } from "../ui/Dialog";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { useUser } from "@/Contexts/userContex";

export default function BecomeArtistDialog({ open, onClose }) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("/images/user.jpg");
  const toast = useSpotifyToast();
  const { fetchCurrentUserProfile } = useUser();

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

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

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
        By proceeding, you agree to give Spotify access to the image you
        choose to upload.
      </p>
    </Dialog>
  );
}
