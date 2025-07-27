"use client";

import { useState, useTransition } from "react";
import { GrAdd } from "react-icons/gr";
import { PiNotePencil } from "react-icons/pi";
import { editUserProfile } from "@/app/(protected)/actions/userActions";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { useUser } from "@/Contexts/userContex";
import { Dialog } from "../ui/Dialog";

export default function EditProfileModal({ currentUser, onClose ,open}) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(currentUser?.name || "");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(
    currentUser.image || "/images/default-user.png"
  );
  const { fetchCurrentUserProfile } = useUser();
  const toast = useSpotifyToast();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.set("type", "editProfile");
    formData.set("name", name);
    if (imageFile) formData.set("image", imageFile);

    startTransition(async () => {
      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast({ text: "Profile update failed" });
        return;
      }

      const result = await res.json();
      if (result.success) {
        await fetchCurrentUserProfile();
        toast({ text: "Profile updated", image: preview });
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

        <h2 className="text-2xl text-white font-bold mb-6">Profile details</h2>

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
              alt="Profile"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
              <PiNotePencil size={40} className="text-white" />
            </div>
          </label>

          {/* Username */}
          <div className="flex flex-col w-full gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
              className="bg-neutral-800 text-white p-3 rounded-md outline-none"
              placeholder="Username"
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
        {/* {pending && <DisabledThreeeDotsLoader />} */}
      
        </Dialog>
  );
}
