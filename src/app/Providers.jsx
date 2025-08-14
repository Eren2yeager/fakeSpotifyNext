"use client";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export default function Providers({ children }) {
  useEffect(() => {
    document.title = "Fake Spotify";
  }, []);

  return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>;
}


