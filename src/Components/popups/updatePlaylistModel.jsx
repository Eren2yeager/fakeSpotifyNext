"use client";

import { useState, useTransition, useContext } from "react";
import { editPlaylist } from "@/app/(protected)/actions/playlistActions";
import { GrAdd } from "react-icons/gr";
import { PiNotePencil } from "react-icons/pi";
import { usePlaylists } from "@/Contexts/playlistsContext";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";

export default function EditPlaylistModal({ playlist, onClose }) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || "");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(
    playlist.image || "/images/notfound.png"
  );

  //   to set the playlists
  const { fetchPlaylists } = usePlaylists();
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
    formData.set("name", name);
    formData.set("description", description);
    if (imageFile) formData.set("image", imageFile);

    startTransition(async () => {
      const ok = await editPlaylist(playlist._id, formData);
      if (ok) {
        toast({
          text: `Changes Saved`,
          image: playlist.image,
        });

        fetchPlaylists();
      }

      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-100 backdrop-blur-xs bg-opacity-60 flex items-center justify-center ">
      <div className="bg-neutral-900 rounded-xl w-full max-w-2xl p-6 relative shadow-2xl">
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
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-800 text-white p-3 rounded-md outline-none"
              placeholder="Playlist Name"
              required
            />
            <textarea
              value={description}
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
          By proceeding, you agree to give access to the image you choose to
          upload. Please make sure you have the right to upload the image.
        </p>
      </div>
    </div>
  );
}
