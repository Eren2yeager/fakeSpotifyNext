"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const { data: session, status } = useSession();

  // Safely fetch user data by ID
  const fetchUserData = useCallback(async (userId) => {
    if (!userId) return null;
    try {
      const formData = new FormData();
      formData.set("type", "getUser");
      formData.set("userId", userId);

      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      return data.user;
    } catch (err) {
      // Optionally log error
      return null;
    }
  }, []);

  // Fetch current user profile (only if session is ready)
  const fetchCurrentUserProfile = useCallback(async () => {
    if (!session?.user?._id) return null;
    try {
      const formData = new FormData();
      formData.set("type", "getUser");
      formData.set("userId", session.user._id);

      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUserProfile(data.user);
      return data.user;
    } catch (err) {
      // Optionally log error
      return null;
    }
  }, [session]);

  return (
    <UserContext.Provider value={{ fetchUserData, fetchCurrentUserProfile, userProfile }}>
      {children}
    </UserContext.Provider>
  );
};
