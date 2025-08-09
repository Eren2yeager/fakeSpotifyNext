"use client";
import React from "react";
import { signIn ,signOut} from "next-auth/react";
import { FaGithub, FaGoogle } from "react-icons/fa";


 function LoginPage() {





   const handleSignIn = async (provider) => {
    await signIn(provider, { callbackUrl: '/' }); // NextAuth will redirect to home after login
  };



  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center px-4">
      <div className="bg-[#121212] rounded-2xl p-10 flex flex-col items-center gap-6 w-full max-w-md shadow-lg">
        <h1 className="text-4xl font-bold text-white">Welcome to Fake Spotify</h1>
        <p className="text-slate-200 font-semibold text-center">Sign in to start listening</p>

        <button
          onClick={() => handleSignIn("google")}
          className="flex items-center gap-3 px-6 py-3 w-full justify-center bg-white text-black rounded-full font-semibold hover:scale-105 transition-transform"
        >
          <FaGoogle />
          Continue with Google
        </button>

        <button
          onClick={() => handleSignIn("github")}
          className="flex items-center gap-3 px-6 py-3 w-full justify-center bg-[#333] text-white rounded-full font-semibold hover:scale-105 transition-transform"
        >
          <FaGithub />
          Continue with GitHub
        </button>



      </div>
    </div>
  );
}


export default React.memo(LoginPage)