// components/BecomeArtistDialog.jsx
import { useState } from "react";
import { Dialog } from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { UploadButton } from "../ui/UploadButton";
import { useSpotifyToast } from "@/Contexts/SpotifyToastContext";
import { useTransition } from "react";
import { useUser } from "@/Contexts/userContex";
export default function BecomeArtistDialog({ open, onClose }) {
  const toast = useSpotifyToast();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);
  const { userProfile, fetchCurrentUserProfile } = useUser();


  const handleSubmit = async () => {
    if (!name || !bio || !image) {
      toast({ text: "All fields are required" });
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("image", image);


    startTransition(async () => {
      const res= await fetch("/api/become-artist", {
        method: "POST",
        body: formData,
      })

 
      
      if(res.ok){
        fetchCurrentUserProfile()
        toast({ text: "You are now an artist!" });
        onClose();
      }else {
        toast({ text: "Some thing went wrong" });
        onClose();
      }
      


    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Become an Artist</h2>

        <Input
          placeholder="Artist Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Textarea
          placeholder="Tell us about yourself"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <UploadButton onFileChange={setImage} />

        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="Artist Preview"
            className="w-20 h-20 rounded-full object-cover mt-2"
          />
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            className="bg-neutral-700 hover:bg-neutral-600"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} >{pending ? "Saving" : "Save"}</Button>
        </div>
      </div>
    </Dialog>
  );
}
