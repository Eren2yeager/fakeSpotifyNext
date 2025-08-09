// context/PlayerContext.js
import { createContext, useContext, useState } from "react";
import { useSession } from "next-auth/react";
const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);

  const { data: session, status } = useSession();

  // to acces any user data from its id
const fetchUserData = async (userId) => {
  const formData = new FormData();
  formData.set("type", "getUser");
  formData.set("userId", userId);

  const res = await fetch("/api/profile", {
    method: "POST",
    body: formData,
    // ❌ DO NOT manually set 'Content-Type' here
    // The browser will automatically set the correct 'multipart/form-data' with boundary
  });

  if (!res.ok) throw new Error("Failed to fetch user");
  const data = await res.json();

  return data.user;
};

  
  const fetchCurrentUserProfile = async () => {
    const formData = new FormData();
    formData.set("type", "getUser");
    formData.set("userId", session.user._id);
    const res = await fetch("/api/profile", {
      method: "POST",
      body: formData,

    });
  
    if (!res.ok) throw new Error("Failed to fetch user");
    const data = await res.json();
    console.log(data.user)
    setUserProfile(data.user)
    return data.user;
  };

  return (
    <UserContext.Provider value={{ fetchUserData, fetchCurrentUserProfile , userProfile}}>
      {children}
    </UserContext.Provider>
  );
};
