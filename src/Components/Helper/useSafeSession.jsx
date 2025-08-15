"use client";
import { useSession } from "next-auth/react";

export function UseSafeSession() {
  const { data: session, status } = useSession();
  return {
    session: session ?? null,
    user: session?.user ?? null,
    status,
    isLoading: status === "loading",
    isAuthenticated: !!session,
  };
}
