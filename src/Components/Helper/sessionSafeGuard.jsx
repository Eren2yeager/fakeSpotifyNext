"use client";
import { useEffect } from "react";
import { useSession  } from "next-auth/react";
import ThreeDotsLoader from "./ThreeDotsLoader";
import { useRouter } from "next/navigation";

export default function SessionGuard({ children, requireAuth = false }) {
  const router = useRouter()
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-screen w-screen flex justify-center items-center"><ThreeDotsLoader/></div>; // You can replace with skeleton/loader
  }

  if (requireAuth && !session) {
      router.push("/login");
      return <div className="h-screen w-screen flex justify-center items-center text-white">You must be signed in to view this page.</div>;
  }



  return children;
}
