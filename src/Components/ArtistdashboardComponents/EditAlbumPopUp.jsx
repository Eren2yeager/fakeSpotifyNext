"use client";
import { GrAdd } from "react-icons/gr";

import { useState } from "react";
import { useTransition } from "react";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { useUser } from "@/Contexts/userContex";
import { Dialog } from "../ui/Dialog";
import { PiNotePencil } from "react-icons/pi";
import { useRouter } from "next/navigation";
const EditALbumPopup = ({ album, open, onClose , onUpdate}) => {
  const [pending, startTransition] = useTransition();
  const toast = useSpotifyToast();
  const [name, setName] = useState(album?.name);
  const [description, setDescription] = useState(album?.description);
  const [image, setImage] = useState(album?.image);
  const [preview, setPreview] = useState(album?.image);

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
    formData.set("id", album._id);
    formData.set("name", name);
    formData.set("description", description);

    if (image) formData.set("image", image);

    startTransition(async () => {
      const res = await fetch("/api/artistDashboard/albums", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        toast({ text: "failed" });
        return;
      }

      const result = await res.json();
      if (result) {
        toast({ text: "Album Edited" });
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

      <h2 className="text-2xl font-bold mb-6  text-white">Edit Album</h2>

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
            alt="album"
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
              Album name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
              className="w-full p-3 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter album name"
              required
            />
          </div>
          <div>
          <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write about this album..."
              disabled={pending}
              className="w-full p-3 h-18 rounded-lg bg-zinc-800 text-white  focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={4}
            ></textarea>
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

export default EditALbumPopup;
