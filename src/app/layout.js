"use client"
import { SessionProvider } from "next-auth/react";
import "@/styles/index.css";
import "@/styles/scrollbar.css";
import { memo, useEffect } from "react";

 function RootLayout({ children }) {
  useEffect(() => {
    document.title = "Fake Spotify";
  }, []);
  

  return (
    <html lang="en">
      <head>
      <script src="https://cdn.lordicon.com/lordicon.js"></script>
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body className="relative m-0 p-0 w-[100vw] h-[100vh] bg-black  overflow-clip">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

export default memo(RootLayout)