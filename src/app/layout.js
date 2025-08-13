"use client"
import { SessionProvider } from "next-auth/react";
import "@/styles/index.css";
import "@/styles/scrollbar.css";
import { memo, useEffect } from "react";
import Script from 'next/script';
 function RootLayout({ children }) {
  useEffect(() => {
    document.title = "Fake Spotify";
  }, []);
  

  return (
    <html lang="en">
      <head>
      <Script src="https://cdn.lordicon.com/lordicon.js" strategy="beforeInteractive" /> 
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