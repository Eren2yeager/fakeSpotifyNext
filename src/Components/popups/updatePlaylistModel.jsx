"use client";

import { useState, useTransition, useContext } from "react";
import { GrAdd } from "react-icons/gr";
import { PiNotePencil } from "react-icons/pi";
import { useLibrary } from "@/Contexts/libraryContext";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { Dialog } from "../ui/Dialog";
import { useImageProcessor } from "../Helper/ImageCropper";

export default function EditPlaylistModal({ playlist, onClose ,open }) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || "");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(
    playlist.image || "/images/notfound.png"
  );

  //   to set the playlists
  const { fetchLibrary } = useLibrary();
  const toast = useSpotifyToast();

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
    const formData = new FormData();
    formData.set("edit", "edit");
    formData.set("name", name);
    formData.set("description", description);
    if (imageFile) formData.set("image", imageFile);
    
    

    startTransition(async () => {
      const res = await fetch(`/api/playlists/${playlist._id}`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast({ text: "Playlist updated" });
        fetchLibrary();
        onClose();
      } else {
        let errorMsg = "Failed to update playlist";
        try {
          const data = await res.json();
          if (data?.error) {
            errorMsg = data.error;
            errorMsg = errorMsg + data?.message
          }
        } catch (e) {
          // fallback to default errorMsg
        }
        toast({ text: errorMsg });
      }
      
    });
  };

  return (
    <Dialog open={open}  onClose={onClose}>

      {/* <div className="bg-neutral-900 rounded-xl w-full max-w-2xl p-6 relative shadow-2xl"> */}
        <button
          onClick={() => {
            onClose();
          }}
          className="absolute top-4 right-4 text-white text-xl"
        >
          <GrAdd className="text-xl transform rotate-45" />
        </button>

        <h2 className="text-2xl text-white font-bold mb-6">Edit details</h2>

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

          {/* Text Fields */}
          <div className="flex flex-col w-full flex-1 gap-3">
            <input
              type="text"
              value={name}
              disabled={pending}
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-800 text-white p-3 rounded-md outline-none"
              placeholder="Playlist Name"
              required
            />
            <textarea
              value={description}
              disabled={pending}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-neutral-800 text-white p-3 rounded-md outline-none resize-none"
              placeholder="Add an optional description"
              rows={4}
            />
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
      {/* </div> */}
    </Dialog>

  );
}
