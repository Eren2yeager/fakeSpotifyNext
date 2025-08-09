import React from "react";
import Link from "next/link";
import { useUser } from "@/Contexts/userContex";
import { useRouter } from "next/navigation";
const ProfileCircle = ({ onClick, text, image }) => {
  return (
    <div className="flex items-center py-0.5" onClick={onClick}>
      {image && (
        <img
          src={image}
          alt={image}
          className=" relative max-w-7 max-h-7 min-w-7 min-h-7 brightness-110 rounded-full"
        />
      )}

      {text && (
        <span className="font-bold text-white hover:underline ml-1.5 cursor-pointer max-w-full  truncate">
          {text}
        </span>
      )}
    </div>
  );
};

export default ProfileCircle;

export const CurrentUserProfileCircle = ({ text }) => {
  const { userProfile } = useUser();
  const router = useRouter();
  return (
    <div
      className="flex items-center justify-start"
      onClick={() => {
        router.push(`/profiles/${userProfile._id}`);
      }}
    >
      {userProfile?.image && (
        <img
          src={userProfile?.image}
          alt={userProfile?.name}
          className=" relative max-w-7 max-h-7 min-w-7 min-h-7 brightness-110 rounded-full"
        />
      )}
      {text && (
        <span className="font-bold text-white hover:underline ml-2 cursor-pointer max-w-full truncate">
          {text}
        </span>
      )}
    </div>
  );
};
