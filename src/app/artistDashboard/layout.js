"use client";
import { SessionProvider } from "next-auth/react";
import "@/styles/index.css";
import "@/styles/scrollbar.css";
import { memo, useEffect } from "react";
import ThreeDotsLoader from "@/Components/Helper/ThreeDotsLoader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ArtistDashboardLayout from "@/layouts/artistDashboardLayout";
import { SpotifyToastProvider } from "@/Contexts/SpotifyToastContext";
function RootLayout({ children }) {
  useEffect(() => {
    document.title = "Artist Dashboard - Fake Spotify";
  }, []);

  const { data: session, status } = useSession();
  const router = useRouter();


  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      if (!session?.user.isArtist) {
        router.push("/profile");
      }
    }
  }, [status, session, router]);

  if (status === "loading")
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <ThreeDotsLoader />
      </div>
    );

  if (!session) return null; // Don’t show anything while redirecting

  return (
    <>
      <SpotifyToastProvider>
        <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
        <div className="w-full h-full overflow-y-auto overflow-x-hidden">
          <ArtistDashboardLayout>{children}</ArtistDashboardLayout>
        </div>
      </SpotifyToastProvider>
    </>
  );
}

export default memo(RootLayout);
