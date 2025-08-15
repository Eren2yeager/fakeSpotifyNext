// app/(protected)/layout.js
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MainLayout from "@/pages/MainLayout";
import BodyToRender from "@/main";
import ThreeDotsLoader from "@/Components/Helper/ThreeDotsLoader";
import SessionGuard from "@/Components/Helper/sessionSafeGuard";
export default function ProtectedLayout({ children }) {


  return (
    <SessionGuard requireAuth>
    <BodyToRender>
    <MainLayout>
      {children}
    </MainLayout>
    </BodyToRender>
    </SessionGuard>
  );
}

