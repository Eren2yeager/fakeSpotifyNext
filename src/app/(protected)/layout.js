// app/(protected)/layout.js
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MainLayout from "@/pages/MainLayout";
import BodyToRender from "@/main";
import ThreeDotsLoader from "@/Components/Helper/ThreeDotsLoader";

export default function ProtectedLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") 
    return  <div className="h-screen w-screen flex justify-center items-center"><ThreeDotsLoader/></div>
  ;

  if (!session) return null; // Don’t show anything while redirecting

  return (
    <BodyToRender>
    <MainLayout>
      {children}
    </MainLayout>
    </BodyToRender>

  );
}

