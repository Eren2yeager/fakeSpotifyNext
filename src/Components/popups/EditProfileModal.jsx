"use client";

import { useState, useTransition } from "react";
import { GrAdd } from "react-icons/gr";
import { PiNotePencil } from "react-icons/pi";
import { editUserProfile } from "@/app/(protected)/actions/userActions";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";

export default function EditProfileModal({ currentUser, onClose }) {
  const [pending, startTransition] = useTransition();
  const [username, setUsername] = useState(currentUser.username || "");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(currentUser.image || "/images/default-user.png");

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
    formData.set("username", username);
    if (imageFile) formData.set("image", imageFile);

    startTransition(async () => {
      const success = await editUserProfile(formData);
      if (success) {
        toast({ text: "Profile updated", image: preview });
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/60 flex items-center justify-center px-4">
      <div className="bg-neutral-900 rounded-xl w-full max-w-xl p-6 relative shadow-2xl">
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
          <label className="group w-40 h-40 bg-neutral-800 rounded-full flex items-center justify-center cursor-pointer overflow-hidden relative">
            <input
              type="file"
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
          By proceeding, you agree to give Spotify access to the image you choose to upload.
        </p>
      </div>
    </div>
  );
}
